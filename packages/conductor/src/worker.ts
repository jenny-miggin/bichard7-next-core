import { ConductorClient, TaskManager } from "@io-orkes/conductor-javascript"
import { defaultConcurrency } from "@moj-bichard7/common/conductor/getTaskConcurrency"
import logger from "@moj-bichard7/common/utils/logger"
import persistPhase1 from "@moj-bichard7/core/conductor-tasks/bichard_process/persistPhase1"
import processPhase1 from "@moj-bichard7/core/conductor-tasks/bichard_process/processPhase1"
import readAhoFromDb from "@moj-bichard7/core/conductor-tasks/bichard_process/readAhoFromDb"
import sendToPhase2 from "@moj-bichard7/core/conductor-tasks/bichard_process/sendToPhase2"
import deleteS3File from "@moj-bichard7/core/conductor-tasks/common/deleteS3File"
import storeAuditLogEvents from "@moj-bichard7/core/conductor-tasks/common/storeAuditLogEvents"
import alertCommonPlatform from "@moj-bichard7/core/conductor-tasks/incomingMessageHandler/alertCommonPlatform"
import convertSpiToAho from "@moj-bichard7/core/conductor-tasks/incomingMessageHandler/convertSpiToAho"
import createAuditLogRecord from "@moj-bichard7/core/conductor-tasks/incomingMessageHandler/createAuditLogRecord"
import compareFiles from "@moj-bichard7/core/phase1/comparison/conductor-tasks/compareFiles"
import generateDayTasks from "@moj-bichard7/core/phase1/comparison/conductor-tasks/generateDayTasks"
import rerunDay from "@moj-bichard7/core/phase1/comparison/conductor-tasks/rerunDay"

import { captureWorkerExceptions } from "./utils"

const client = new ConductorClient({
  serverUrl: process.env.CONDUCTOR_URL ?? "http://localhost:5002/api",
  USERNAME: process.env.CONDUCTOR_USERNAME,
  PASSWORD: process.env.CONDUCTOR_PASSWORD
})

const tasks = [
  alertCommonPlatform,
  compareFiles,
  convertSpiToAho,
  createAuditLogRecord,
  deleteS3File,
  generateDayTasks,
  persistPhase1,
  processPhase1,
  readAhoFromDb,
  rerunDay,
  sendToPhase2,
  storeAuditLogEvents
].map(captureWorkerExceptions)

const taskManager = new TaskManager(client, tasks, { options: { concurrency: defaultConcurrency } })

logger.info("Starting polling...")

const signalHandler = (signal: string) => {
  logger.info(`${signal} signal received.`)
  taskManager.stopPolling()
}

process.on("SIGINT", signalHandler)
process.on("SIGTERM", signalHandler)
process.on("SIGQUIT", signalHandler)

process.on("exit", (code) => {
  logger.info("Exiting gracefully with code: ", code)
})

taskManager.startPolling()
