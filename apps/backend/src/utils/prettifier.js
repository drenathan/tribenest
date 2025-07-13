const pinoPretty = require("pino-pretty");
const chalk = require("chalk");

module.exports = function pinoPrettyTransport(opts) {
  return pinoPretty({
    ...opts,
    messageFormat: (log) => {
      const { tags, msg } = log;
      const coloredTags = tags ? tags.map((tag) => chalk.green(tag)).join(":") : "";
      return `${coloredTags} => ${msg}`;
    },
  });
};
