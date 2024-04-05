jest.setTimeout(30_000)
jest.retryTimes(10)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs"
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import createS3Config from "@moj-bichard7/common/s3/createS3Config"
import fs from "fs"
import waitForExpect from "wait-for-expect"

const endpoint = (process.env.S3_ENDPOINT = "http://localhost:4566")
const accessKeyId = (process.env.S3_AWS_ACCESS_KEY_ID = "FAKE")
const secretAccessKey = (process.env.S3_AWS_SECRET_ACCESS_KEY = "FAKE")

const s3Config = createS3Config()

const db = new DynamoDBClient({
  endpoint,
  region: "eu-west-2",
  credentials: { accessKeyId, secretAccessKey }
})

const client = new SQSClient({
  endpoint,
  region: "eu-west-2",
  credentials: { accessKeyId, secretAccessKey }
})

const sendFileToS3 = async (srcFilename: string, destFilename: string, bucket: string) => {
  const client = new S3Client(s3Config)
  const Body = await fs.promises.readFile(srcFilename)
  const command = new PutObjectCommand({ Bucket: bucket, Key: destFilename, Body })
  return client.send(command)
}

const getDynamoRecord = async (s3Path: string, tableName: string): Promise<undefined | Record<string, any>> => {
  const getCommand = new GetCommand({ TableName: tableName, Key: { s3Path } })
  const docClient = DynamoDBDocumentClient.from(db)
  const result = await docClient.send(getCommand)
  return result.Item
}

const setDynamoRecordToFailedStatus = async (record: Record<string, unknown>, tableName: string) => {
  const updatedRecord = {
    ...record,
    latestResult: 0
  }

  const putCommand = new PutCommand({ TableName: tableName, Item: updatedRecord })
  const docClient = DynamoDBDocumentClient.from(db)
  await docClient.send(putCommand)
}

const getPhaseTableName = (phase: number): string => {
  switch (phase) {
    case 1:
      return process.env.PHASE1_COMPARISON_TABLE_NAME ?? "bichard-7-production-comparison-log"
    case 2:
      return process.env.PHASE2_COMPARISON_TABLE_NAME ?? "bichard-7-production-phase2-comparison-log"
    case 3:
      return process.env.PHASE3_COMPARISON_TABLE_NAME ?? "bichard-7-production-phase3-comparison-log"
    default:
      return `No table exists for phase ${phase}`
  }
}

describe("Rerun failures workflow", () => {
  it("should rerun failed phase 2 comparisons and update dynamo record", async () => {
    const phase = 2
    const fixturePath = `../core/phase${phase}/tests/fixtures/e2e-comparison/test-001.json`
    const tableName = getPhaseTableName(phase)
    //write file to s3 with unique id
    const firstMessageS3Path = `${new Date().toISOString().replace(/:/g, "_")}.json`
    await sendFileToS3(fixturePath, firstMessageS3Path, "comparisons")
    const secondMessageDate = new Date()
    secondMessageDate.setDate(secondMessageDate.getDate() - 1)
    const secondMessageS3Path = `${secondMessageDate.toISOString().replace(/:/g, "_")}.json`
    await sendFileToS3(fixturePath, secondMessageS3Path, "comparisons")

    //wait for dynamo to be updated
    let firstRecord: Record<string, any> | undefined, secondRecord: Record<string, any> | undefined
    await waitForExpect(async () => {
      firstRecord = await getDynamoRecord(firstMessageS3Path, tableName)
      expect(firstRecord?.["history"]).toHaveLength(1)
      expect(firstRecord).toBeDefined()
      expect(firstRecord).toHaveProperty("s3Path", firstMessageS3Path)

      secondRecord = await getDynamoRecord(secondMessageS3Path, tableName)
      expect(secondRecord?.["history"]).toHaveLength(1)
      expect(secondRecord).toBeDefined()
      expect(secondRecord).toHaveProperty("s3Path", secondMessageS3Path)
    })

    await setDynamoRecordToFailedStatus(firstRecord!, tableName)

    const startDate = new Date()
    startDate.setHours(startDate.getHours() - 1)

    const command = new SendMessageCommand({
      QueueUrl: "rerunFailures",
      DelaySeconds: 3,
      MessageBody: JSON.stringify({ startDate: startDate.toISOString() })
    })

    await client.send(command)

    await waitForExpect(
      async () => {
        const updatedFirstRecord = await getDynamoRecord(firstMessageS3Path, tableName)
        expect(updatedFirstRecord).toBeDefined()
        expect(updatedFirstRecord?.["history"]).toHaveLength(2)
        expect(firstRecord?.["latestRunAt"]).not.toBe(updatedFirstRecord?.latestRunAt)

        const updatedSecondRecord = await getDynamoRecord(secondMessageS3Path, tableName)
        expect(updatedSecondRecord).toBeDefined()
        expect(updatedSecondRecord?.["history"]).toHaveLength(1)
        expect(secondRecord?.["latestRunAt"]).toBe(updatedSecondRecord?.latestRunAt)
      },
      60_000,
      5_000
    )
  })
})
