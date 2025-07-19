import { NextRequest, NextResponse } from 'next/server'
import { updatePromptHistory, deletePromptHistory } from '@/lib/database'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    const { id } = await params

    const updatedItem = await updatePromptHistory(id, body)
    
    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Failed to update prompt history:', error)
    return NextResponse.json(
      { error: 'Failed to update prompt history' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await deletePromptHistory(id)
    
    return NextResponse.json({ message: 'Prompt history deleted successfully' })
  } catch (error) {
    console.error('Failed to delete prompt history:', error)
    return NextResponse.json(
      { error: 'Failed to delete prompt history' },
      { status: 500 }
    )
  }
} 