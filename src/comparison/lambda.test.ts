/* eslint-disable jest/no-conditional-expect */
jest.setTimeout(10000)
import "tests/helpers/setEnvironmentVariables"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import fs from "fs"
import lambda from "src/comparison/lambda"
import MockS3 from "tests/helpers/MockS3"
import MockDynamo from "tests/helpers/MockDynamo"
import { ZodError } from "zod"
import DynamoGateway from "./DynamoGateway/DynamoGateway"
import type * as dynamodb from "@aws-sdk/client-dynamodb"
import createS3Config from "./createS3Config"
import { isError } from "src/comparison/Types"
import type { DocumentClient } from "aws-sdk/clients/dynamodb"
import MockDate from "mockdate"
import createDynamoDbConfig from "./createDynamoDbConfig"

const bucket = "comparison-bucket"
const s3Config = createS3Config()

const dynamoDbTableConfig: dynamodb.CreateTableCommandInput = {
  TableName: process.env.COMPARISON_TABLE_NAME,
  KeySchema: [{ AttributeName: "s3Path", KeyType: "HASH" }],
  AttributeDefinitions: [{ AttributeName: "s3Path", AttributeType: "S" }],
  BillingMode: "PAY_PER_REQUEST"
}
const dynamoDbGatewayConfig = createDynamoDbConfig()

const uploadFile = async (fileName: string) => {
  const client = new S3Client(s3Config)
  const Body = await fs.promises.readFile(fileName)
  const command = new PutObjectCommand({ Bucket: bucket, Key: fileName, Body })
  return client.send(command)
}

describe("Comparison lambda", () => {
  let s3Server: MockS3
  let dynamoServer: MockDynamo
  const dynamoGateway = new DynamoGateway(dynamoDbGatewayConfig)

  beforeAll(async () => {
    s3Server = new MockS3(bucket)
    await s3Server.start()
    dynamoServer = new MockDynamo()
    await dynamoServer.start(8000)
  })

  afterAll(async () => {
    await s3Server.stop()
    await dynamoServer.stop()
  })

  beforeEach(async () => {
    MockDate.reset()
    await s3Server.reset()
    await dynamoServer.setupTable(dynamoDbTableConfig)
  })

  it("should return a passing comparison result", async () => {
    const mockedDate = new Date()
    MockDate.set(mockedDate)
    const response = await uploadFile("test-data/comparison/passing.json")
    expect(response).toBeDefined()

    const s3Path = "test-data/comparison/passing.json"
    const result = await lambda({
      detail: { bucket: { name: bucket }, object: { key: s3Path } }
    })
    expect(result).toStrictEqual({
      triggersMatch: true,
      exceptionsMatch: true,
      xmlOutputMatches: true,
      xmlParsingMatches: true
    })

    const record = await dynamoGateway.getOne(dynamoDbTableConfig.TableName!, "s3Path", s3Path)
    expect(isError(record)).toBe(false)

    const actualRecord = record as DocumentClient.GetItemOutput
    expect(actualRecord.Item).toStrictEqual({
      _: "_",
      s3Path,
      initialRunAt: mockedDate.toISOString(),
      initialResult: 1,
      latestRunAt: mockedDate.toISOString(),
      latestResult: 1,
      history: [
        {
          runAt: mockedDate.toISOString(),
          result: 1,
          details: {
            triggersMatch: 1,
            exceptionsMatch: 1,
            xmlOutputMatches: 1,
            xmlParsingMatches: 1
          }
        }
      ]
    })
  })

  it("should return a failing comparison result", async () => {
    const response = await uploadFile("test-data/comparison/failing.json")
    expect(response).toBeDefined()
    const result = await lambda({
      detail: { bucket: { name: bucket }, object: { key: "test-data/comparison/failing.json" } }
    })
    expect(result).toStrictEqual({
      triggersMatch: false,
      exceptionsMatch: true,
      xmlOutputMatches: false,
      xmlParsingMatches: false
    })
  })

  it("should throw an error if the event did not match our schema", async () => {
    expect.assertions(2)
    try {
      await lambda({ wrongPath: "dummy" })
    } catch (e: unknown) {
      const error = e as Error
      expect(error).toBeInstanceOf(ZodError)
      expect((error as ZodError).issues[0].code).toBe("invalid_type")
    }
  })
})
