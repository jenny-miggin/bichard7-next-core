import type { CourtResultMatchingSummary } from "src/comparison/types/MatchingComparisonOutput"
import type { AnnotatedHearingOutcome } from "src/types/AnnotatedHearingOutcome"

const badlyAnnotatedSingleCaseMatch = (
  expected: CourtResultMatchingSummary,
  actual: CourtResultMatchingSummary,
  _: AnnotatedHearingOutcome,
  __: AnnotatedHearingOutcome
): boolean => {
  if ("exceptions" in actual || "exceptions" in expected) {
    return false
  }

  const expectedCourtCaseReferences = expected.offences.reduce((acc: Set<string>, offence) => {
    if (offence.courtCaseReference) {
      acc.add(offence.courtCaseReference)
    }
    return acc
  }, new Set<string>())

  if (expectedCourtCaseReferences.size === 1) {
    return expected.offences.every((expectedMatch) =>
      actual.offences.some(
        (actualMatch) =>
          expectedMatch.hoSequenceNumber === actualMatch.hoSequenceNumber &&
          expectedMatch.pncSequenceNumber === actualMatch.pncSequenceNumber
      )
    )
  }
  return false
}

export default badlyAnnotatedSingleCaseMatch
