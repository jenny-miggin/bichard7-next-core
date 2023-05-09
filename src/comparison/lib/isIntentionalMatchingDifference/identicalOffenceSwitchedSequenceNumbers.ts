import type { CourtResultMatchingSummary, OffenceMatchingSummary } from "src/comparison/types/MatchingComparisonOutput"
import type { AnnotatedHearingOutcome, Offence } from "src/types/AnnotatedHearingOutcome"
import hoOffencesAreEqual from "../hoOffencesAreEqual"

const groupIdenticalOffences = (offences: Offence[]): Offence[][] => {
  const output = []
  for (const offence of offences) {
    let found = false
    for (const group of output) {
      const otherOffence = group[0]
      if (hoOffencesAreEqual(offence, otherOffence)) {
        group.push(offence)
        found = true
        break
      }
    }
    if (!found) {
      output.push([offence])
    }
  }
  return output
}

const groupOffences = (offences: Offence[], matches: OffenceMatchingSummary[]): (number | undefined)[][] => {
  const identicalOffenceGroups = groupIdenticalOffences(offences)
  return identicalOffenceGroups.map((group) =>
    group.map(
      (hoOffence) =>
        matches.find((match) => match.hoSequenceNumber === hoOffence.CourtOffenceSequenceNumber)?.pncSequenceNumber
    )
  )
}

const identicalOffenceSwitchedSequenceNumbers = (
  expected: CourtResultMatchingSummary,
  actual: CourtResultMatchingSummary,
  expectedAho: AnnotatedHearingOutcome,
  actualAho: AnnotatedHearingOutcome
): boolean => {
  if ("exceptions" in actual || "exceptions" in expected) {
    return false
  }

  const expectedHoOffences = expectedAho.AnnotatedHearingOutcome.HearingOutcome.Case.HearingDefendant.Offence
  const expectedOffenceGroups = groupOffences(expectedHoOffences, expected.offences)
  const actualHoOffences = actualAho.AnnotatedHearingOutcome.HearingOutcome.Case.HearingDefendant.Offence
  const actualOffenceGroups = groupOffences(actualHoOffences, actual.offences)
  const differenceBeforeSort = JSON.stringify(expectedOffenceGroups) !== JSON.stringify(actualOffenceGroups)

  expectedOffenceGroups.forEach((group) => group.sort())
  actualOffenceGroups.forEach((group) => group.sort())

  return differenceBeforeSort && JSON.stringify(expectedOffenceGroups) === JSON.stringify(actualOffenceGroups)
}

export default identicalOffenceSwitchedSequenceNumbers
