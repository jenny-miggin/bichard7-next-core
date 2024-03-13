import { readFileSync } from "fs"
import parseSpiResult from "../parseSpiResult"
import PopulateOffenceResults from "./PopulateOffenceResults"

describe("PopulateOffenceResults", () => {
  const message = readFileSync("phase1/tests/fixtures/input-message-001-variations.xml", "utf-8")
  const courtResult = parseSpiResult(message).DeliverRequest.Message.ResultedCaseMessage

  it("should transform SPI Offences to Hearing Outcome Offences", () => {
    const result = new PopulateOffenceResults(courtResult, courtResult.Session.Case.Defendant.Offence[0]).execute()

    expect(result).toBeDefined()
    expect(result).toMatchSnapshot()
  })
})
