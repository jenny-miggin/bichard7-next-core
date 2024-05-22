import exclusionOrderDisposalText from "./exclusionOrderDisposalText"

describe("check exclusionOrderDisposalText", () => {
  it("Given and empty input string, the disposal text is an empty string", () => {
    const resultVariableText = ""
    const result = exclusionOrderDisposalText(resultVariableText)

    expect(result).toBe("")
  })
  it("Given input containing both matching strings, the disposal text is correct", () => {
    const pattern_1 = "THE DEFENDANT IS NOT TO ENTER"
    const pattern_2 = "THE DEFENDANT IS TO BE"
    const resultVariableText = pattern_1 + " foobar baz " + pattern_2
    const result = exclusionOrderDisposalText(resultVariableText)

    expect(result).toBe("EXCLUDED FROM foobar baz")
  })
  it("Given input containing only first matching string, the disposal text is correct", () => {
    const pattern_1 = "THE DEFENDANT IS NOT TO ENTER"
    const resultVariableText = pattern_1 + " foobar baz"
    const result = exclusionOrderDisposalText(resultVariableText)

    expect(result).toBe("EXCLUDED FROM foobar baz")
  })
})
