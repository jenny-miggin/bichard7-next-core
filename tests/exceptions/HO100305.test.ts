jest.setTimeout(30000)

import { offenceResultClassPath } from "src/use-cases/enrichHearingOutcome/enrichFunctions/enrichCourtCases/errorPaths"
import generateMessage from "tests/helpers/generateMessage"
import PostgresHelper from "tests/helpers/PostgresHelper"
import processMessage from "tests/helpers/processMessage"

describe("HO100305", () => {
  afterAll(() => {
    PostgresHelper.closeConnection()
  })

  it("should create an exception if the case has no conviction date", async () => {
    const inputMessage = generateMessage({
      offences: [{ results: [{}], convictionDate: null }]
    })

    const {
      hearingOutcome: { Exceptions: exceptions }
    } = await processMessage(inputMessage, {
      expectTriggers: false
    })

    expect(exceptions).toStrictEqual([
      {
        code: "HO100305",
        path: offenceResultClassPath(0, 0)
      }
    ])
  })

  it("should create an exception if the case has no conviction date and is adjourned", async () => {
    const inputMessage = generateMessage({
      offences: [
        { results: [{ code: 4001, nextHearing: { nextHearingDetails: {} } }, { code: 2050 }], convictionDate: null }
      ]
    })

    const {
      hearingOutcome: { Exceptions: exceptions }
    } = await processMessage(inputMessage, {
      expectTriggers: false
    })

    expect(exceptions).toStrictEqual([
      {
        code: "HO100305",
        path: offenceResultClassPath(0, 0)
      }
    ])
  })
})
