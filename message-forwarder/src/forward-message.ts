import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { v4 as uuid } from "uuid"
import type MqGateway from "./MqGateway/MqGateway"
import type { PromiseResult } from "./Result"
import createS3Config from "./createS3Config"

const s3Config = createS3Config()

const destinationType = process.env.DESTINATION_TYPE ?? "mq"
const destination = process.env.DESTINATION ?? "HEARING_OUTCOME_INPUT_QUEUE"

const forwardMessage = async (message: string, mqGateway: MqGateway): PromiseResult<void> => {
  if (destinationType === "mq") {
    await mqGateway.sendMessage(message, destination)
    console.log("Sent to MQ")
  } else if (destinationType === "s3") {
    const client = new S3Client(s3Config)
    const command = new PutObjectCommand({
      Body: message,
      Bucket: destination,
      Key: `${uuid()}.xml`
    })

    try {
      await client.send(command)
      console.log("Sent to S3")
    } catch (e) {
      return e as Error
    }
  }
}

export default forwardMessage
