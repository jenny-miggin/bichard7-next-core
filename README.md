# Bichard 7 Core

The code to replace the processing logic of Bichard 7

## Testing

To run unit tests against new Bichard:

```bash
npm i # If packages not already installed
npm t
```

To run unit tests against old Bichard (*requires the [old Bichard](https://github.com/ministryofjustice/bichard7-next) stack to be running*):

```bash
npm i # If packages not already installed
npm run test:bichard
```

## Excluding Triggers

Triggers can be excluded for either a specific `force` or `court` by adding the trigger code (e.g, `TRPR0001`) to either `data/excluded-trigger-configuration.json` for production systems or `data/excluded-trigger-configuration.test.json` for test environments.

The choice of which `excluded-trigger-configuration` file to use is decided in `src/lib/excludedTriggerConfig.ts` using the `NODE_ENV` environment variable. The test configuration file (`excluded-trigger-configuration.test.json`) is run if `NODE_ENV` is set as `testing`.

| Environment Variable   | Description                                                       |
| ---------------------- | ----------------------------------------------------------------- |
| NODE_ENV               | The environment node is being run in                              |

## Comparing New and Old Bichard

Old Bichard is currently configured to publish its outputs (AHO, triggers, exceptions), plus the original message it received to the `PROCESSING_VALIDATION_QUEUE` queue in ActiveMQ. We can compare these outputs against new Bichard by running:

```bash
npm i # If packages not already installed
npm run compare
```

This requires the [old Bichard](https://github.com/ministryofjustice/bichard7-next) stack to be running. Outputs from old Bichard can be driven onto the queue by running either `make pushq` in the [old Bichard repo](https://github.com/ministryofjustice/bichard7-next), or by running `npm t` in the [e2e testing repo](https://github.com/ministryofjustice/bichard7-next-tests).

`npm run compare` runs the `scripts/compareResults.ts` script to check the output of old Bichard against new Bichard. A tally is kept of the results and can be seen by exiting the script with `Ctrl-C`. If `compareResults.ts` can't process any messages off the queue (empty messages, ActiveMQ errors ect), these are recorded as `skipped` and will be counted seperatly.

If all comparisons between the new and old Bichard are successful, `compareResults.ts` will exit with a `0` code. If any comparisions have failed or messages have been skipped, it will exit with a code of `1`.

### Comparing outputs locally

If being run locally, it may be clearer to run:

```bash
npm run compare:dev
```

This mode pretty-prints the `Pino` logs and makes it a bit clearer as to what's going on. However, it is **NOT** suitable for production environments (as per their docs).

### Configuration

| Environment Variable   | Description                                                       | Default                            |
| ---------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| MQ_HOST                | The host URL of the ActiveMQ messaging queue                      | localhost                          |
| MQ_PORT                | The host port of the ActiveMQ messaging queue                     | 61613                              |
| MQ_CONNECTION_HOST     | The connection target for the ActiveMQ messaging queue            | /                                  |
| MQ_CONNECTION_LOGIN    | The login username for the ActiveMQ messaging queue               | admin                              |
| MQ_CONNECTION_PASSCODE | The login password for the ActiveMQ messaging queue               | admin                              |
| MQ_QUEUE_NAME          | The ActiveMQ queue to subscribe to                                | /queue/PROCESSING_VALIDATION_QUEUE |
| PINO_LOG_LEVEL         | The logging level used by Pino, the logger used within the script | info                               |
