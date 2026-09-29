import { NextRequest, NextResponse } from "next/server"
import { CONFIG } from "@/lib/config"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lon)

  if (!(Math.abs(latitude) <= 90) || !(Math.abs(longitude) <= 180)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 })
  }

  try {
    // Rolling sample of the last 10 complete calendar years
    const lastYear = new Date().getFullYear() - 1
    const url = `${CONFIG.api.openMeteoArchiveBaseUrl}/archive?latitude=${latitude}&longitude=${longitude}&start_date=${lastYear - 9}-01-01&end_date=${lastYear}-12-31&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) })
    if (!res.ok) {
      throw new Error(`Archive API returned status ${res.status}`)
    }

    const data = await res.json()
    const times: string[] = data.daily?.time || []
    const maxs: number[] = data.daily?.temperature_2m_max || []
    const mins: number[] = data.daily?.temperature_2m_min || []
    const precips: number[] = data.daily?.precipitation_sum || []

    const now = new Date()
    const targetMonthNum = (now.getMonth() + 1).toString().padStart(2, "0")
    const targetDayNum = now.getDate().toString().padStart(2, "0")
    const monthName = now.toLocaleString("en-US", { month: "long" })

    // 1. Calculate today's historical normals (matching today's date across all years)
    let sumMax = 0
    let sumMin = 0
    let sumPrecip = 0
    let count = 0
    let recordHigh = { temp: -999, year: "" }
    let recordLow = { temp: 999, year: "" }

    // 2. Calculate 12-month climate averages
    const monthSums: Record<
      number,
      { max: number; min: number; precip: number; count: number }
    > = {}
    for (let m = 1; m <= 12; m++) {
      monthSums[m] = { max: 0, min: 0, precip: 0, count: 0 }
    }

    for (let i = 0; i < times.length; i++) {
      const [y, m, d] = times[i].split("-")
      const mInt = parseInt(m, 10)
      const maxVal = maxs[i]
      const minVal = mins[i]
      const pVal = precips[i] || 0

      if (maxVal !== null && minVal !== null) {
        monthSums[mInt].max += maxVal
        monthSums[mInt].min += minVal
        monthSums[mInt].precip += pVal
        monthSums[mInt].count++

        if (m === targetMonthNum && d === targetDayNum) {
          count++
          sumMax += maxVal
          sumMin += minVal
          sumPrecip += pVal

          if (maxVal > recordHigh.temp) recordHigh = { temp: maxVal, year: y }
          if (minVal < recordLow.temp) recordLow = { temp: minVal, year: y }
        }
      }
    }

    if (count === 0) {
      throw new Error("Archive returned no samples for today's date")
    }
    const avgHigh = parseFloat((sumMax / count).toFixed(1))
    const avgLow = parseFloat((sumMin / count).toFixed(1))
    const avgPrecip = parseFloat((sumPrecip / count).toFixed(1))

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ]
    const monthlyAverages = monthNames.map((name, idx) => {
      const mNum = idx + 1
      const mData = monthSums[mNum]
      const c = Math.max(1, mData.count)
      return {
        month: name,
        avgHigh: parseFloat((mData.max / c).toFixed(1)),
        avgLow: parseFloat((mData.min / c).toFixed(1)),
        avgRainfall: Math.round(mData.precip / (c / 30)), // approximate monthly accumulation in mm
      }
    })

    return NextResponse.json(
      {
        date: `${monthName} ${now.getDate()}`,
        monthName,
        sampleYears: count,
        avgHigh,
        avgLow,
        avgPrecipitation: avgPrecip,
        recordHigh,
        recordLow,
        monthlyAverages,
      },
      // Normals only change by day.
      { headers: { "Cache-Control": "public, max-age=3600, s-maxage=21600" } }
    )
  } catch (err) {
    console.warn("Climate normals archive query failed", err)
    return NextResponse.json(
      { error: "Climate archive is unavailable." },
      { status: 503 }
    )
  }
}
