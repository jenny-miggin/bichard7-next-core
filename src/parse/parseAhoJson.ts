import { dateReviver } from "src/lib/axiosDateTransformer"
import type { AnnotatedHearingOutcome } from "src/types/AnnotatedHearingOutcome"

const parseAhoJson = (aho: unknown): AnnotatedHearingOutcome => {
  return JSON.parse(JSON.stringify(aho), dateReviver) as AnnotatedHearingOutcome
}

export default parseAhoJson
