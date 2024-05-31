import type { ConductorWorker } from "@io-orkes/conductor-javascript"
import completed from "@moj-bichard7/common/conductor/helpers/completed"
import s3TaskDataFetcher from "@moj-bichard7/common/conductor/middleware/s3TaskDataFetcher"
import type Phase2Result from "../../phase2/types/Phase2Result"
import { phase2ResultSchema } from "../../phase2/schemas/phase2Result"
import getAnnotatedDatasetFromDataset from "../../phase2/pncUpdateDataset/getAnnotatedDatasetFromDataset"
import putPncUpdateError from "../../phase2/putPncUpdateError"
import failedTerminal from "@moj-bichard7/common/conductor/helpers/failedTerminal"

const persistPhase2: ConductorWorker = {
  taskDefName: "persist_phase2",
  execute: s3TaskDataFetcher<Phase2Result>(phase2ResultSchema, (task) => {
    const { s3TaskData } = task.inputData

    if (s3TaskData.triggers.length === 0 && s3TaskData.outputMessage.Exceptions.length === 0) {
      return failedTerminal("No triggers or exceptions present but persist_phase2 was called")
    }

    if (s3TaskData.outputMessage.Exceptions.length > 0) {
      const annotatedPncUpdateDataset = getAnnotatedDatasetFromDataset(s3TaskData.outputMessage)
      putPncUpdateError(annotatedPncUpdateDataset)
    }

    return completed("Phase 2 result persisted successfully")
  })
}

export default persistPhase2
