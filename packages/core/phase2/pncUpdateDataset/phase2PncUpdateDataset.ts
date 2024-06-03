import EventCode from "@moj-bichard7/common/types/EventCode"
import type AuditLogger from "../../phase1/types/AuditLogger"
import type { PncUpdateDataset } from "../../types/PncUpdateDataset"
import allPncOffencesContainResults from "../allPncOffencesContainResults"
import getOperationSequence from "../getOperationSequence"
import type Phase2Result from "../types/Phase2Result"
import { Phase2ResultType } from "../types/Phase2Result"
import checkForOrderVariedRevokedResultCodes from "./checkForOrderVariedRevokedResultCodes"
import combineTriggerLists from "./combineTriggerLists"
import getAnnotatedDatasetFromDataset from "./getAnnotatedDatasetFromDataset"
import identifyPostUpdateTriggers from "./identifyPostUpdateTriggers"
import identifyPreUpdateTriggers from "./identifyPreUpdateTriggers"
import markErrorAsResolved from "./markErrorAsResolved"
import putTriggerEvent from "./putTriggerEvent"
import refreshOperationSequence from "./refreshOperationSequence"
import type { Trigger } from "../../phase1/types/Trigger"

const phase2PncUpdateDataset = (pncUpdateDataset: PncUpdateDataset, auditLogger: AuditLogger): Phase2Result => {
  const outputMessage = structuredClone(pncUpdateDataset)
  const correlationId = outputMessage.AnnotatedHearingOutcome.HearingOutcome.Hearing.SourceReference.UniqueID
  let triggers: Trigger[] = []

  auditLogger.info(EventCode.ReceivedResubmittedHearingOutcome)

  const orderVariedRevokedExceptionRaised = checkForOrderVariedRevokedResultCodes(outputMessage)
  const allOffencesContainResults = allPncOffencesContainResults(outputMessage)

  if (!orderVariedRevokedExceptionRaised && allOffencesContainResults) {
    if (outputMessage.PncOperations.length === 0) {
      const operations = getOperationSequence(outputMessage, true)

      if (outputMessage.Exceptions.length === 0) {
        if (operations.length > 0) {
          outputMessage.PncOperations.concat(operations)
        } else {
          const postUpdateTriggersArray = identifyPostUpdateTriggers(outputMessage)
          const preUpdateTriggersArray = identifyPreUpdateTriggers(outputMessage)
          triggers = combineTriggerLists(preUpdateTriggersArray, postUpdateTriggersArray)

          markErrorAsResolved(outputMessage)
          putTriggerEvent(getAnnotatedDatasetFromDataset(outputMessage), triggers)
          markErrorAsResolved(outputMessage)
        }
      }
    } else {
      refreshOperationSequence(outputMessage)
    }

    if (outputMessage.PncOperations.length > 0) {
      console.log("To be implemented: PNCUpdateChoreographyDS.java:205")
      auditLogger.info(EventCode.HearingOutcomeSubmittedPhase3)
    }
  }

  outputMessage.HasError = false
  if (!outputMessage.PncOperations) {
    outputMessage.PncOperations = []
  }

  return {
    auditLogEvents: auditLogger.getEvents(),
    correlationId,
    outputMessage,
    triggers,
    resultType: Phase2ResultType.success
  }
}

export default phase2PncUpdateDataset
