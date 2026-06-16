import { Injectable, Logger } from '@nestjs/common'

// Zero-shot classifier (NLI). Runs in-process via onnxruntime-node — local, private.
const MODEL = 'Xenova/bart-large-mnli'
const BATCH_SIZE = 8

// Candidate labels; the first is the "spam" class.
const LABELS = ['spam or advertisement', 'normal message']
const SPAM_LABEL = LABELS[0]
const ML_THRESHOLD = 0.5

// High-precision lexical signals for group-chat promo/spam — these catch the
// obvious cases (links, invite URLs, money/prize wording) the model is weak on.
const SPAM_PATTERNS = [
  /https?:\/\/|www\./i,
  /chat\.whatsapp\.com/i,
  /\b(free|win|winner|congratulations|click here|subscribe|promo|discount|offer|cash|prize|crypto|investment|earn \$?\d+)\b/i,
]

type ZeroShotOutput = { labels: string[]; scores: number[] }

@Injectable()
export class SpamService {
  private readonly logger = new Logger(SpamService.name)
  private classifier: Promise<
    (input: string[], labels: string[]) => Promise<ZeroShotOutput | ZeroShotOutput[]>
  > | null = null

  private regexHit(text: string): boolean {
    return SPAM_PATTERNS.some((p) => p.test(text))
  }

  /** Lazily load the model once, on first use. */
  private load() {
    if (!this.classifier) {
      this.logger.log(`Loading zero-shot model ${MODEL} (first use)`)
      this.classifier = import('@huggingface/transformers').then(({ pipeline }) =>
        pipeline('zero-shot-classification', MODEL, { dtype: 'q8' }),
      ) as Promise<(input: string[], labels: string[]) => Promise<ZeroShotOutput | ZeroShotOutput[]>>
    }
    return this.classifier
  }

  /**
   * Hybrid spam/promo detection: high-precision regex OR zero-shot model.
   * Returns booleans aligned to the input order.
   */
  async classify(texts: string[]): Promise<boolean[]> {
    if (texts.length === 0) return []

    const flags = texts.map((t) => this.regexHit(t))

    // Only run the (slow) model on messages the regex didn't already catch.
    const pending = texts
      .map((text, index) => ({ text, index }))
      .filter(({ index }) => !flags[index])

    if (pending.length > 0) {
      const classifier = await this.load()
      for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        const batch = pending.slice(i, i + BATCH_SIZE)
        const output = await classifier(
          batch.map((b) => b.text),
          LABELS,
        )
        const items = Array.isArray(output) ? output : [output]
        items.forEach((item, j) => {
          const idx = item.labels.indexOf(SPAM_LABEL)
          const score = idx >= 0 ? item.scores[idx] : 0
          if (score >= ML_THRESHOLD) flags[batch[j].index] = true
        })
      }
    }

    return flags
  }
}
