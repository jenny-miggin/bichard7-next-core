import type Phase1Result from "src/types/Phase1Result"
import { Phase1ResultType } from "src/types/Phase1Result"
import processPhase1 from "src/workers/phase1/processPhase1"
import sendToPhase2 from "src/workers/phase1/sendToPhase2"
import storeAuditLogEvents from "src/workers/phase1/storeAuditLogEvents"
import storeInQuarantineBucket from "src/workers/phase1/storeInQuarantineBucket"

const main = async (s3Path: string) => {
  let result: Phase1Result
  result = await processPhase1(s3Path)

  if (result.resultType === Phase1ResultType.failure) {
    console.error("Message rejected!")
    storeInQuarantineBucket(s3Path)
  } else if (result.resultType === Phase1ResultType.success) {
    console.log("Message processed, sending to phase 2")
    result = await sendToPhase2(result)
  }

  await storeAuditLogEvents(result)
}

export default main
