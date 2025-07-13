import pino from "pino";
import fs from "fs";
import { IS_PRODUCTION, IS_TEST } from "@config/secrets";
// @ts-ignore
// import nrPino from "@newrelic/pino-enricher";
import os from "os";
import path from "path";
// wrPTevRyDy8d2Ewr5aBtKEKk

const targets: pino.TransportTargetOptions[] = [
  {
    target: path.join(__dirname, "./prettifier.js"),
    options: {
      destination: 1,
      colorize: true,
      ignore: "hostname,pid,environment,deployment,level,tags",
    },
    level: "debug",
  },
];

// if (!IS_TEST) {
//   targets.push({
//     target: "@logtail/pino",
//     options: { sourceToken: "wrPTevRyDy8d2Ewr5aBtKEKk" },
//     level: "info",
//   });

//   // // add new relic

//   // targets.push({
//   //   target: nrPino,
//   //   level: "info",
//   //   options: {},
//   // });
// }
const transport = pino.transport({
  targets,
});

const baseLogger = pino(transport);

export const logger = baseLogger.child({
  environment: process.env.NODE_ENV,
  deployment: process.env.DEPLOYMENT,
  hostname: os.hostname(),
});
