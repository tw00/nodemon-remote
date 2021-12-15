const defaultConfig = {
  port: 2020,
  commands: {},
  webhook: {},
  responseIncludeStdout: false,
  responseIncludeErrors: true,
};

module.exports = {
  ...defaultConfig,
  ...require("rcfile")("remote"),
};
