import { NextRequest, NextResponse } from 'next/server'
import { 
  getPromptHistory, 
  createPromptHistory, 
  deleteAllPromptHistory 
} from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const filters = {
      search: searchParams.get('search') || undefined,
      status: searchParams.get('status')?.split(',') || undefined,
      favorites: searchParams.get('favorites') === 'true' || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const history = await getPromptHistory(filters)
    
    return NextResponse.json(history)
  } catch (error) {
    console.error('Failed to fetch prompt history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prompt history' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { prompt, sqlQuery, executionTime, status, resultCount, chartTypes, tags } = body

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    const historyItem = await createPromptHistory({
      prompt,
      sqlQuery,
      executionTime,
      status,
      resultCount,
      chartTypes,
      tags,
    })

    return NextResponse.json(historyItem, { status: 201 })
  } catch (error) {
    console.error('Failed to create prompt history:', error)
    return NextResponse.json(
      { error: 'Failed to create prompt history' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    await deleteAllPromptHistory()
    
    return NextResponse.json({ message: 'All prompt history deleted successfully' })
  } catch (error) {
    console.error('Failed to delete prompt history:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt history' },
      { status: 500 }
    )
  }
} 