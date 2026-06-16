export type MessageType = 'text' | 'media' | 'system'

export type MediaType = 'photo' | 'video' | 'sticker' | 'gif' | 'audio' | 'document' | 'other'

export interface ParsedMessage {
  timestamp: Date
  sender: string
  text: string
  type: MessageType
  mediaType?: MediaType
  mentions: string[]
  edited: boolean
}

// Strip the invisible bidi marks WhatsApp sprinkles into exported lines.
// NOTE: keep U+2068 (⁨) and U+2069 (⁩) — they wrap @mentions and are removed later.
const BIDI = /[‎‏‪-‮⁦⁧]/g

// [M/D/YY, H:MM:SS AM] Sender: message
const HEADER =
  /^\[(\d{1,2})\/(\d{1,2})\/(\d{2,4}),\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*([AP]M)?\]\s+([^:]+):\s?([\s\S]*)$/

const EDITED_MARKER = '<This message was edited>'

const SYSTEM_PATTERNS = [
  'Messages and calls are end-to-end encrypted',
  'created this group',
  'added',
  'removed',
  'left',
  'changed the subject',
  'changed this group',
  'changed the group',
  'changed their phone number',
  'You were added',
  'joined using this group',
  'pinned a message',
  'deleted this group',
]

function clean(value: string): string {
  return value.replace(BIDI, '').trim()
}

function parseTimestamp(
  month: string,
  day: string,
  year: string,
  hour: string,
  minute: string,
  second: string | undefined,
  meridiem: string | undefined,
): Date {
  let m = Number(month)
  let d = Number(day)
  // Locale guard: if the first field can't be a month but the second can, it's D/M.
  if (m > 12 && d <= 12) [m, d] = [d, m]

  let y = Number(year)
  if (y < 100) y += 2000

  let h = Number(hour)
  if (meridiem === 'PM' && h < 12) h += 12
  if (meridiem === 'AM' && h === 12) h = 0

  return new Date(y, m - 1, d, h, Number(minute), Number(second ?? '0'))
}

function extractMentions(text: string): string[] {
  // Mentions are wrapped in U+2068 ... U+2069, e.g. @⁨~Mouaz Kashif⁩
  const mentions: string[] = []
  const re = /@⁨([^⁩]+)⁩/g
  let match: RegExpExecArray | null
  while ((match = re.exec(text)) !== null) {
    mentions.push(match[1].replace(/^~\s*/, '').trim())
  }
  return mentions
}

function detectMedia(body: string): MediaType | null {
  const attached = body.match(/<attached:\s*([^>]+)>/i)
  if (attached) {
    const name = attached[1].toUpperCase()
    if (name.includes('PHOTO') || /\.(JPG|JPEG|PNG|WEBP)$/.test(name)) {
      return name.includes('STICKER') ? 'sticker' : 'photo'
    }
    if (name.includes('STICKER')) return 'sticker'
    if (name.includes('VIDEO') || /\.(MP4|MOV)$/.test(name)) return 'video'
    if (name.includes('GIF')) return 'gif'
    if (name.includes('AUDIO') || /\.(OPUS|MP3|M4A|OGG)$/.test(name)) return 'audio'
    return 'document'
  }
  // Phone exports without media files use "<media> omitted" style markers.
  const omitted = body.toLowerCase().match(/\b(image|video|sticker|gif|audio|document)\b\s+omitted/)
  if (omitted) {
    const kind = omitted[1]
    return kind === 'image' ? 'photo' : (kind as MediaType)
  }
  return null
}

function classify(rawBody: string): {
  type: MessageType
  mediaType?: MediaType
  text: string
  edited: boolean
} {
  // Detect "edited" before stripping bidi, then clean.
  const edited = rawBody.includes(EDITED_MARKER)
  let body = clean(rawBody.replace(EDITED_MARKER, ''))

  const media = detectMedia(body)
  if (media) return { type: 'media', mediaType: media, text: '', edited }

  // System lines carry no real authored text.
  if (SYSTEM_PATTERNS.some((p) => body.includes(p))) {
    return { type: 'system', text: body, edited }
  }

  // Mention markers are noise for sentiment; keep a readable plain-text form.
  body = body.replace(/[⁨⁩]/g, '')
  return { type: 'text', text: body, edited }
}

/** Parse a raw WhatsApp .txt export into structured messages. */
export function parseWhatsAppExport(raw: string): ParsedMessage[] {
  const lines = raw.split(/\r?\n/)
  const messages: ParsedMessage[] = []

  for (const line of lines) {
    const header = clean(line).match(HEADER)

    if (!header) {
      // Continuation of the previous message (multi-line body).
      const prev = messages[messages.length - 1]
      if (prev && line.trim()) {
        prev.text = prev.text ? `${prev.text}\n${line.trim()}` : line.trim()
      }
      continue
    }

    const [, month, day, year, hour, minute, second, meridiem, sender, body] = header
    const { type, mediaType, text, edited } = classify(body)

    messages.push({
      timestamp: parseTimestamp(month, day, year, hour, minute, second, meridiem),
      sender: clean(sender).replace(/^~\s*/, ''),
      text,
      type,
      mediaType,
      mentions: extractMentions(body),
      edited,
    })
  }

  return messages
}
