const defaultConfig = {
  port: 2020,
  commands: {},
};

module.exports = {
  ...defaultConfig,
  ...require("rcfile")("remote"),
};
