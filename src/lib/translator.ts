import Anthropic from '@anthropic-ai/sdk'
import { TranscriptSegment, TranslatedMessage, SessionContext } from '@/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Use Claude Sonnet for cost-effective quality
const MODEL = 'claude-sonnet-4-5-20241022'

export interface TranslationResult {
  messages: TranslatedMessage[]
  reasoning?: string
}

/**
 * Translate a speaker's full speech into casual chat messages
 */
export async function translateSpeech(
  segment: TranscriptSegment,
  context: SessionContext,
  previousSpeakers: string[] = []
): Promise<TranslationResult> {
  const prompt = buildTranslationPrompt(segment, context, previousSpeakers)

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return parseTranslationResponse(text)
}

/**
 * Translate a procedural event (from procedural speaker like Presiding Officer)
 */
export async function translateProceduralEvent(
  segment: TranscriptSegment,
  context: SessionContext
): Promise<TranslatedMessage[]> {
  // Common procedural patterns we can translate directly without LLM
  const text = segment.text.toLowerCase()

  if (text.includes('clerk will report')) {
    return [{ type: 'system', content: 'Resolution read into the record', originalExcerpt: segment.text.slice(0, 200) }]
  }

  if (text.includes('question is on')) {
    return [{ type: 'system', content: 'Vote called', originalExcerpt: segment.text.slice(0, 200) }]
  }

  if (text.includes('yeas and nays')) {
    // Extract vote count if present
    const voteMatch = segment.text.match(/yeas\s+(\d+)[,\s]+nays\s+(\d+)/i)
    if (voteMatch) {
      return [{
        type: 'vote_result',
        content: `Vote result: ${voteMatch[1]} yeas, ${voteMatch[2]} nays`,
        originalExcerpt: segment.text.slice(0, 200),
      }]
    }
  }

  if (text.includes('senator from')) {
    // Recognition - can skip or make brief system message
    const stateMatch = segment.text.match(/senator from (\w+)/i)
    if (stateMatch) {
      return [{ type: 'system', content: `Senator from ${stateMatch[1]} recognized`, originalExcerpt: segment.text.slice(0, 200) }]
    }
  }

  // For other procedural text, use LLM for concise translation
  const prompt = `You are translating a procedural statement from the ${context.chamber === 'senate' ? 'Senate' : 'House'} floor.

PROCEDURAL TEXT:
"""
${segment.text.slice(0, 1000)}
"""

Translate this into a brief, casual system message (one sentence max). Focus on what's happening procedurally.
If it's routine recognition or housekeeping that adds no value, respond with just: SKIP

Output only the translated message or SKIP. No explanation needed.`

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 256,
    messages: [{ role: 'user', content: prompt }],
  })

  const result = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

  if (result === 'SKIP' || result.length < 3) {
    return []
  }

  return [{ type: 'procedural', content: result, originalExcerpt: segment.text.slice(0, 200) }]
}

/**
 * Build the full translation prompt for a speech
 */
function buildTranslationPrompt(
  segment: TranscriptSegment,
  context: SessionContext,
  previousSpeakers: string[]
): string {
  return `You are translating a Congressional floor speech into a casual group chat format.

SESSION CONTEXT:
- Chamber: ${context.chamber === 'senate' ? 'Senate' : 'House'}
- Date: ${context.date}
${context.agendaItem ? `- Current agenda item: ${context.agendaItem.title}` : ''}
${context.agendaItem?.billNumber ? `- Bill/Resolution: ${context.agendaItem.billNumber}` : ''}

SPEAKER: ${segment.speaker}

PREVIOUS SPEAKERS THIS ITEM: ${previousSpeakers.length > 0 ? previousSpeakers.join(', ') : 'None - this is the first speaker'}

---

FULL ORIGINAL SPEECH:
"""
${segment.text}
"""

---

INSTRUCTIONS:

Walk through the speech section by section. For each distinct section or point:

1. **QUOTE** the relevant portion of the original text
2. **REASON** about what's important here and how to translate it:
   - What's the core point?
   - What can be cut (filler, procedural language, repetition)?
   - What must be kept (facts, dates, key arguments, good quotes)?
   - Is this procedural (motion, yield) or substantive (argument, evidence)?
3. **TRANSLATE** into one or more casual chat messages

Be generous with how many messages you produce - it's better to have more messages
that capture the full substance than to over-compress and lose meaning.

Use conversational tone: contractions, lowercase (except proper nouns), casual phrasing.
Preserve notable quotes or zingers - those give personality.
If the speaker explains something educational (like how a procedure works), keep that.

OUTPUT FORMAT:

For each section, output:

### Section N
**ORIGINAL:**
> [quote the relevant portion]

**REASONING:**
[explain what you're keeping/cutting and why]

**TRANSLATED:**
- [message 1]
- [message 2, if needed]
- ...

After all sections, output the final JSON:

\`\`\`json
{
  "messages": [
    {
      "type": "speech" | "procedural" | "system",
      "content": "the translated message",
      "originalExcerpt": "the portion of original text this came from (first 200 chars)"
    }
  ]
}
\`\`\``
}

/**
 * Parse the LLM response into structured messages
 */
function parseTranslationResponse(response: string): TranslationResult {
  // Extract reasoning (everything before the JSON)
  const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/)

  let reasoning = response
  let messages: TranslatedMessage[] = []

  if (jsonMatch) {
    reasoning = response.slice(0, jsonMatch.index).trim()

    try {
      const parsed = JSON.parse(jsonMatch[1])
      messages = parsed.messages || []
    } catch {
      // If JSON parsing fails, extract messages from the TRANSLATED sections
      messages = extractMessagesFromReasoning(response)
    }
  } else {
    // No JSON found, try to extract from TRANSLATED sections
    messages = extractMessagesFromReasoning(response)
  }

  // Validate and clean messages
  messages = messages
    .filter(m => m.content && m.content.length > 0)
    .map(m => ({
      type: m.type || 'speech',
      content: m.content.trim(),
      originalExcerpt: (m.originalExcerpt || '').slice(0, 200),
    }))

  return { messages, reasoning }
}

/**
 * Extract messages from the reasoning text if JSON parsing fails
 */
function extractMessagesFromReasoning(text: string): TranslatedMessage[] {
  const messages: TranslatedMessage[] = []

  // Look for **TRANSLATED:** sections
  const translatedPattern = /\*\*TRANSLATED:\*\*\s*([\s\S]*?)(?=###|$|\*\*ORIGINAL:)/gi
  let match

  while ((match = translatedPattern.exec(text)) !== null) {
    const section = match[1].trim()
    const lines = section.split('\n').filter(l => l.trim().startsWith('-'))

    for (const line of lines) {
      const content = line.replace(/^-\s*/, '').trim()
      if (content) {
        messages.push({
          type: 'speech',
          content,
          originalExcerpt: '',
        })
      }
    }
  }

  return messages
}

/**
 * Batch translate multiple segments efficiently
 */
export async function translateSegments(
  segments: TranscriptSegment[],
  context: SessionContext
): Promise<Map<number, TranslatedMessage[]>> {
  const results = new Map<number, TranslatedMessage[]>()
  const previousSpeakers: string[] = []

  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i]

    let messages: TranslatedMessage[]

    if (segment.isProceduralSpeaker) {
      messages = await translateProceduralEvent(segment, context)
    } else {
      const result = await translateSpeech(segment, context, [...previousSpeakers])
      messages = result.messages

      // Track this speaker for context
      if (!previousSpeakers.includes(segment.speaker)) {
        previousSpeakers.push(segment.speaker)
        // Keep only last 5 speakers for context
        if (previousSpeakers.length > 5) {
          previousSpeakers.shift()
        }
      }
    }

    results.set(i, messages)

    // Small delay to avoid rate limiting
    await sleep(100)
  }

  return results
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
