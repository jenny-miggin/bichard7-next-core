import type { CourtResultMatchingSummary } from "src/comparison/types/MatchingComparisonOutput"
import type { AnnotatedHearingOutcome } from "src/types/AnnotatedHearingOutcome"

// We added force 91 to Bichard and core, but there was an overlap where we were handling
// incoming messages for force 91 when it was not configured

const fixedForce91 = (
  expected: CourtResultMatchingSummary | null,
  actual: CourtResultMatchingSummary | null,
  expectedAho: AnnotatedHearingOutcome,
  actualAho: AnnotatedHearingOutcome,
  ___: AnnotatedHearingOutcome
): boolean => {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) {
    return false
  }

  const expectedOuCode = expectedAho.AnnotatedHearingOutcome.HearingOutcome.Case.ForceOwner?.OrganisationUnitCode
  const actualOuCode = actualAho.AnnotatedHearingOutcome.HearingOutcome.Case.ForceOwner?.OrganisationUnitCode

  return expectedOuCode === "010000" && actualOuCode === "91HQ00"
}

export default fixedForce91
