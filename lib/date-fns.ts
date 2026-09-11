/**
 * date-fns compatible date formatting module
 */

export function toDate(argument: Date | number | string): Date {
  const argStr = Object.prototype.toString.call(argument)
  if (
    argument instanceof Date ||
    (typeof argument === "object" && argStr === "[object Date]")
  ) {
    return new Date(argument.getTime())
  } else if (typeof argument === "number" || typeof argument === "string") {
    return new Date(argument)
  }
  return new Date(NaN)
}

export function isValid(date: unknown): boolean {
  if (date instanceof Date) {
    return !isNaN(date.getTime())
  }
  if (typeof date === "number" || typeof date === "string") {
    return !isNaN(new Date(date).getTime())
  }
  return false
}

export function format(
  date: Date | number,
  formatStr: string,
  _options?: Record<string, unknown>
): string {
  const d = toDate(date)
  if (isNaN(d.getTime())) {
    throw new RangeError("Invalid time value")
  }

  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hours24 = d.getHours()
  const hours12 = hours24 % 12 || 12
  const minutes = d.getMinutes()
  const seconds = d.getSeconds()
  const ampm = hours24 < 12 ? "AM" : "PM"

  return formatStr.replace(
    /'([^']*)'|yyyy|yy|MM|M|dd|d|HH|H|hh|h|mm|m|ss|s|a|aaa/g,
    (match, literal) => {
      if (literal !== undefined) {
        return literal
      }
      switch (match) {
        case "yyyy":
          return String(year).padStart(4, "0")
        case "yy":
          return String(year).slice(-2)
        case "MM":
          return String(month).padStart(2, "0")
        case "M":
          return String(month)
        case "dd":
          return String(day).padStart(2, "0")
        case "d":
          return String(day)
        case "HH":
          return String(hours24).padStart(2, "0")
        case "H":
          return String(hours24)
        case "hh":
          return String(hours12).padStart(2, "0")
        case "h":
          return String(hours12)
        case "mm":
          return String(minutes).padStart(2, "0")
        case "m":
          return String(minutes)
        case "ss":
          return String(seconds).padStart(2, "0")
        case "s":
          return String(seconds)
        case "a":
          return ampm
        case "aaa":
          return ampm.toLowerCase()
        default:
          return match
      }
    }
  )
}

export function formatISO(date: Date | number): string {
  const d = toDate(date)
  return d.toISOString()
}
