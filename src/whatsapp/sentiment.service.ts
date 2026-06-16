import { Injectable, Logger } from '@nestjs/common'

export type SentimentLabel = 'positive' | 'negative' | 'neutral'

export interface SentimentResult {
  label: SentimentLabel
  score: number
}

// Multilingual 3-class (positive/negative/neutral) sentiment model. ONNX port runs in-process via onnxruntime-node
const MODEL = 'Xenova/distilbert-base-multilingual-cased-sentiments-student'
const BATCH_SIZE = 32

@Injectable()
export class SentimentService {
  private readonly logger = new Logger(SentimentService.name)
  private classifier: Promise<(input: string[]) => Promise<unknown>> | null = null

  /** Lazily load the model once, on first use. */
  private load() {
    if (!this.classifier) {
      this.logger.log(`Loading sentiment model ${MODEL} (first use)`)
      // Dynamic import: transformers.js is ESM-only.
      this.classifier = import('@huggingface/transformers').then(({ pipeline }) =>
        pipeline('sentiment-analysis', MODEL, { dtype: 'q8' }),
      ) as Promise<(input: string[]) => Promise<unknown>>
    }
    return this.classifier
  }

  /** Classify each text. Returns results aligned to the input order. */
  async classify(texts: string[]): Promise<SentimentResult[]> {
    if (texts.length === 0) return []

    const classifier = await this.load()
    const results: SentimentResult[] = []

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE)
      const output = (await classifier(batch)) as Array<{ label: string; score: number }>
      for (const item of output) {
        results.push({ label: this.normalize(item.label), score: item.score })
      }
    }

    return results
  }

  private normalize(label: string): SentimentLabel {
    const l = label.toLowerCase()
    if (l.includes('pos')) return 'positive'
    if (l.includes('neg')) return 'negative'
    return 'neutral'
  }
}
