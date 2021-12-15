const defaultConfig = {
  port: 2020,
  commands: {},
  webhook: {},
};

module.exports = {
  ...defaultConfig,
  ...require("rcfile")("remote"),
};
