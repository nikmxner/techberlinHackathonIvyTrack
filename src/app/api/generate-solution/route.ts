import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const { errorMessage } = await req.json()
  if (!errorMessage) {
    return NextResponse.json({ error: 'Missing errorMessage' }, { status: 400 })
  }

  // build prompt to enforce JSON output
  const prompt = `
Du bist ein Hilfsassistent für Entwickler.
Erkläre die folgende Fehlermeldung in einfacher Sprache in genau einem vollständigen Satz (länger als fünf Wörter) und nenne anschließend drei gängige Lösungsansätze oder Best Practices als Liste.
Gib ausschließlich JSON zurück im Format:
{"explanation":"…","fixes":["…","…","…"]}

Fehlermeldung:
${errorMessage}
`

  try {
    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2
    })

    const content = resp.choices[0].message?.content || ''
    const parsed = JSON.parse(content)
    return NextResponse.json(parsed)
  } catch (err) {
    console.error('OpenAI error', err)
    return NextResponse.json({ error: 'API‐Fehler' }, { status: 500 })
  }
} 