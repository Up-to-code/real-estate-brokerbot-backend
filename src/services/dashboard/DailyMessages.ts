import { Request, Response } from "express"
 import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns"
import { prisma } from "../../lib/prisma"

export const updateDailyMessagesCount = async (req: Request, res: Response) => {
  const today = new Date()
  const start = startOfDay(today)
  const end = endOfDay(today)

  const count = await prisma.message.count({
    where: { createdAt: { gte: start, lte: end } },
  })

  await prisma.dailyMessageStat.upsert({
    where: { date: start },
    update: { count },
    create: { date: start, count },
  })

  res.json({ message: "تم تحديث عدد الرسائل", count })
}

export const getDailyMessagesThisMonth = async () => {
  const start = startOfMonth(new Date())
  const end = endOfMonth(new Date())

  const data = await prisma.dailyMessageStat.findMany({
    where: { date: { gte: start, lte: end } },
    orderBy: { date: "asc" },
  })

  return data
}


export const getMonthlyStats = async (_: Request, res: Response) => {
  const start = startOfYear(new Date())
  const end = endOfYear(new Date())

  const data = await prisma.$queryRaw<
    { month: number; total: number }[]
  >`SELECT EXTRACT(MONTH FROM date) as month, SUM(count)::int as total
     FROM "DailyMessageStat"
     WHERE date BETWEEN ${start} AND ${end}
     GROUP BY month ORDER BY month ASC;`

  res.json(data)
}

export const getYearlyStats = async (_: Request, res: Response) => {
  const data = await prisma.$queryRaw<
    { year: number; total: number }[]
  >`SELECT EXTRACT(YEAR FROM date) as year, SUM(count)::int as total
     FROM "DailyMessageStat"
     GROUP BY year ORDER BY year ASC;`

  res.json(data)
}
