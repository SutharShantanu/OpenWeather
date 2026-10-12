import { expect, it } from "vitest"
import { format } from "@/lib/date-fns"
import { formatDate } from "@/lib/format"

it("formats ordinal day and month names", () => {
  const d = (day: number) => new Date(2026, 9, day)
  expect(formatDate(d(10), "long")).toBe("10th Oct, 2026")
  expect(formatDate(d(1), "long")).toBe("1st Oct, 2026")
  expect(formatDate(d(2), "long")).toBe("2nd Oct, 2026")
  expect(formatDate(d(3), "long")).toBe("3rd Oct, 2026")
  expect(formatDate(d(11), "long")).toBe("11th Oct, 2026")
  expect(formatDate(d(22), "long")).toBe("22nd Oct, 2026")
  expect(formatDate(d(10), "dmy")).toBe("10 Oct 2026")
  expect(formatDate(d(10), "mdy")).toBe("Oct 10, 2026")
  expect(format(d(10), "MMMM")).toBe("October")
  expect(formatDate(d(10), "iso")).toBe("2026-10-10")
})
