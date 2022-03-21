import { TriggerCode } from "../types/TriggerCode"
import type TriggerConfig from "../types/TriggerConfig"
import type { TriggerGenerator } from "../types/TriggerGenerator"
import TriggerRecordable from "../types/TriggerRecordable"
import generateTriggersFromResultQualifier from "./generateTriggersFromResultQualifier"

const config: TriggerConfig = {
  triggerCode: TriggerCode.TRPR0024,
  resultCodeQualifier: "LH",
  caseLevelTrigger: true,
  triggerRecordable: TriggerRecordable.Both
}

const generator: TriggerGenerator = (hearingOutcome, _) => generateTriggersFromResultQualifier(hearingOutcome, config)

export default generator
