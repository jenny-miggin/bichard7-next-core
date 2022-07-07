import { lookupOffenceByCjsCode } from "src/dataLookup"
import enrichCourtCases from "src/enrichAho/enrichFunctions/enrichCourtCases"
import type { AnnotatedHearingOutcome } from "src/types/AnnotatedHearingOutcome"
import type PncGateway from "src/types/PncGateway"
import type { PncCourtCase, PncOffence, PncPenaltyCase } from "src/types/PncQueryResult"

const addTitle = (offence: PncOffence): PncOffence => {
  offence.offence.title = lookupOffenceByCjsCode(offence.offence.cjsOffenceCode)?.offenceTitle
  return offence
}

const addTitleToCaseOffences = (cases: PncPenaltyCase[] | PncCourtCase[] | undefined) =>
  cases && cases.forEach((c) => c.offences.forEach(addTitle))

export default (annotatedHearingOutcome: AnnotatedHearingOutcome, pncGateway: PncGateway): AnnotatedHearingOutcome => {
  annotatedHearingOutcome.PncQueryDate = pncGateway.queryTime

  const pncResult = pncGateway.query(
    annotatedHearingOutcome.AnnotatedHearingOutcome.HearingOutcome.Case.HearingDefendant.ArrestSummonsNumber
  )
  if (pncResult instanceof Error) {
    annotatedHearingOutcome.PncErrorMessage = pncResult.message
  } else {
    annotatedHearingOutcome.PncQuery = pncResult
  }

  addTitleToCaseOffences(annotatedHearingOutcome.PncQuery?.courtCases)
  addTitleToCaseOffences(annotatedHearingOutcome.PncQuery?.penaltyCases)

  if (annotatedHearingOutcome.PncQuery !== undefined) {
    annotatedHearingOutcome.AnnotatedHearingOutcome.HearingOutcome.Case.RecordableOnPNCindicator = true
  }

  annotatedHearingOutcome = enrichCourtCases(annotatedHearingOutcome)

  return annotatedHearingOutcome
}
