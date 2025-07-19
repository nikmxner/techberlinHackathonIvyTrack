import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Database utilities
export async function createPromptHistory(data: {
  prompt: string
  sqlQuery?: string
  executionTime?: number
  status: 'success' | 'error' | 'pending'
  resultCount?: number
  chartTypes?: string[]
  tags?: string[]
}) {
  return await prisma.promptHistory.create({
    data: {
      ...data,
      chartTypes: data.chartTypes ? JSON.stringify(data.chartTypes) : null,
      tags: data.tags ? JSON.stringify(data.tags) : null,
    },
  })
}

export async function getPromptHistory(filters?: {
  search?: string
  status?: string[]
  favorites?: boolean
  limit?: number
  offset?: number
}) {
  const where: any = {}

  if (filters?.search) {
    where.prompt = {
      contains: filters.search,
      mode: 'insensitive',
    }
  }

  if (filters?.status) {
    where.status = {
      in: filters.status,
    }
  }

  if (filters?.favorites) {
    where.isFavorite = true
  }

  const items = await prisma.promptHistory.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: filters?.limit || 50,
    skip: filters?.offset || 0,
  })

  return items.map((item: any) => ({
    ...item,
    chartTypes: item.chartTypes ? JSON.parse(item.chartTypes) : [],
    tags: item.tags ? JSON.parse(item.tags) : [],
  }))
}

export async function updatePromptHistory(id: string, data: {
  isFavorite?: boolean
  tags?: string[]
  status?: 'success' | 'error' | 'pending'
  executionTime?: number
  resultCount?: number
}) {
  return await prisma.promptHistory.update({
    where: { id },
    data: {
      ...data,
      tags: data.tags ? JSON.stringify(data.tags) : undefined,
    },
  })
}

export async function deletePromptHistory(id: string) {
  return await prisma.promptHistory.delete({
    where: { id },
  })
}

export async function deleteAllPromptHistory() {
  return await prisma.promptHistory.deleteMany()
}

export async function getPromptHistoryStats() {
  const total = await prisma.promptHistory.count()
  const successful = await prisma.promptHistory.count({
    where: { status: 'success' },
  })
  const favorites = await prisma.promptHistory.count({
    where: { isFavorite: true },
  })

  return {
    total,
    successful,
    favorites,
    successRate: total > 0 ? (successful / total) * 100 : 0,
  }
} 