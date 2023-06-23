workspace "Bichard Old" {
  model {
    !include lib/users.dsl

    !include lib/hmcts.dsl

    cjsm = softwareSystem "CJSM" {
      tags "Existing System"
    }

    group "CJSE" {
      qsolution = softwareSystem "PSN Proxy" "Q-Solution" "Nginx" {
        tags "Existing System"
      }

      exiss = softwareSystem "ExISS" {
        tags "Existing System"
      }


      bichard = softwareSystem "Bichard" {
        beanconnect = container "Beanconnect"

        messageTransfer = container "Message Transfer Lambda" {
          incomingS3Bucket = component "External Incoming S3 bucket" {
            tags "Queue"
          }

          transferProcess = component "Transfer lambda" {
            tags "Lambda"
          }
        }

        incomingMessageHandler = container "Incoming Message Handler Step Function" {
          internalIncomingS3Bucket = component "Internal Incoming S3 bucket" {
            tags "Queue"
          }

          storeMessage = component "Store Message" {
            tags "Lambda"
          }

          sendToBichard = component "Send to Bichard" {
            tags "Lambda"
          }

          recordSentToBichard = component "Record Sent to Bichard" {
            tags "Lambda"
          }
        }

        eventLambda = container "Event Lambda"

        eventHandler = container "Event Handler Step Function" {
          eventS3Bucket = component "Event S3 bucket" {
            tags "Queue"
          }

          writeToAuditLog = component "Write to Audit Log" {
            tags "Lambda"
          }
        }

        activeMQ = container "Active MQ" "" "Active MQ"

        nginxAuthProxy = container "Nginx Auth Proxy" "" "Nginx" {
          url "https://github.com/ministryofjustice/bichard7-next-infrastructure-docker-images/tree/main/Nginx_Auth_Proxy"
        }

        database = container "Bichard Database" "" "PostgreSQL" "Database" {
          tags "Existing System"
        }

        emailSystem = container "Email System" "" "Postfix" {
          url "https://github.com/ministryofjustice/bichard7-next-infrastructure-docker-images/tree/main/Postfix"
        }

        bichardJavaApplication = container "Bichard Java Application" "" "Java EE"{
          tags "Existing System"
        }

        bichardUserService = container "Bichard User Service" "An application to provide user authentication and user management" "Next.js, TypeScript & React" {
          url "https://github.com/ministryofjustice/bichard7-next-user-service"
          tags "API"
        }

        auditLogApi = container "Audit Log" {
          tags "API"

          auditLogApiGateway = component "Audit Log API Gateway"
          auditLogApiLambda = component "Audit Log API Lambda"
          dynamoDB = component "DynamoDB" "" "DynamoDB"
        }
      }
    }

    !include lib/home-office.dsl

    # Relationships between people and software systems
    policeUser -> qsolution "Uses"
    policeUser -> pnc "Uses"
    cjsm -> policeUser "Gets email"
    policeUser -> nginxAuthProxy "Uses"

    # Relationships between software systems
    commonPlatform -> exiss "Sends result of a court case"
    libra -> exiss "Sends result of a court case"
    qsolution -> pnc "Uses"

    bichardJavaApplication -> beanconnect

    beanconnect -> qsolution

    qsolution -> pnc

    # Relationships to/from components
    emailSystem -> cjsm "Sends verification code"

    bichardUserService -> emailSystem "Sends verification code"
    nginxAuthProxy -> bichardJavaApplication
    nginxAuthProxy -> bichardUserService "Uses"

    bichardUserService -> database "Reads from / Writes to"
    bichardJavaApplication -> database "Reads from / Writes to"

    exiss -> incomingS3Bucket
    incomingS3Bucket -> transferProcess
    transferProcess -> internalIncomingS3Bucket
    internalIncomingS3Bucket -> storeMessage
    storeMessage -> auditLogApi
    storeMessage -> sendToBichard
    sendToBichard -> activeMQ
    sendToBichard -> recordSentToBichard
    recordSentToBichard -> auditLogApi

    activeMQ -> eventLambda
    eventLambda -> eventS3Bucket

    activeMQ -> bichardJavaApplication
    bichardJavaApplication -> activeMQ

    # Audit Logger
    auditLogApiGateway -> auditLogApiLambda
    auditLogApiLambda -> dynamoDB

  }

  views {
    systemlandscape "SystemLandscape" {
      include *
      autoLayout lr
    }

    systemContext bichard {
      include *
      autoLayout lr
    }

    container bichard {
      include *
      autoLayout
    }

    component incomingMessageHandler {
      include *
      autoLayout lr
    }

    component messageTransfer {
      include *
      autoLayout
    }

    component auditLogApi {
      include *
      autoLayout lr
    }

    theme default

    styles {
      element "Web Browser" {
        shape WebBrowser
      }

      element "Database" {
        shape Cylinder
      }

      element "API" {
        shape hexagon
      }

      element "Queue" {
        shape "Pipe"
      }

      element "Lambda" {
        shape "Diamond"
      }

      element "Existing System" {
        background #999999
        color #ffffff
      }
    }
  }
}
