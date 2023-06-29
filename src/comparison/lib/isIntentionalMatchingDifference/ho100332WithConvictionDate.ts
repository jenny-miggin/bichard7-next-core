import type { CourtResultMatchingSummary } from "src/comparison/types/MatchingComparisonOutput"
import type { AnnotatedHearingOutcome } from "src/types/AnnotatedHearingOutcome"
import { ExceptionCode } from "src/types/ExceptionCode"

// Core uses Conviction Date on the incoming offences to disambiguate between offence matches. This means it
// is able to match in some cases where Bichard can't.

const ho100332WithConvictionDate = (
  expected: CourtResultMatchingSummary,
  actual: CourtResultMatchingSummary,
  expectedAho: AnnotatedHearingOutcome,
  __: AnnotatedHearingOutcome
): boolean => {
  if (!("exceptions" in expected) || "exceptions" in actual) {
    return false
  }

  const ho100332s = expected.exceptions.filter((exception) => exception.code === ExceptionCode.HO100332)
  const bichardRaisesHo100332 = ho100332s.length > 0

  const coreMatches = !("exceptions" in actual)

  const offenceIndices = ho100332s.map((e) => e.path[5])

  const exceptionOffences = expectedAho.AnnotatedHearingOutcome.HearingOutcome.Case.HearingDefendant.Offence.filter(
    (_, index) => offenceIndices.includes(index)
  )

  const ho100332HasConvictionDate = exceptionOffences.some((hoOffence) => !!hoOffence.ConvictionDate)

  return bichardRaisesHo100332 && coreMatches && ho100332HasConvictionDate
}

export default ho100332WithConvictionDate
