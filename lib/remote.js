const { promisify } = require("util");
const logger = require("debug")("remote");
const config = require("./config");
const exec = promisify(require("child_process").exec);

module.exports = async function handleRequest({ body }, options) {
  try {
    const { cmd: cmdInput, ...templateVars } = body;

    if (handleNodemonCommands(cmdInput, options)) {
      return { status: "Success" };
    }

    if (!(cmdInput in config.commands)) {
      return { status: "CmdNotFound" };
    }

    const { cmd: cmdRaw } = config.commands[cmdInput] || {};

    if (!cmdRaw) {
      return { status: "CmdEmpty" };
    }

    const cmdInterpolated = fillTemplate(cmdRaw, sanatize(templateVars));
    logger("executing: %s", cmdInterpolated);

    const result = await exec(cmdInterpolated);
    logger("success: %o%o", result.stdout, result.stderr);

    return { status: "Success", ...result };
  } catch (error) {
    logger("failed: %s", error.message);
    return { status: "CmdExecutionFailed" };
  }
};

async function handleNodemonCommands(cmd, options) {
  const { nodemon } = options;

  if (!nodemon) {
    throw new Error("NodemonNotAvailable");
  }

  if (cmd === "nodemon:restart") {
    await nodemon.restart();
    return true;
  }

  if (cmd === "nodemon:reset") {
    await nodemon.reset();
    return true;
  }

  return false;
}

function fillTemplate(templateString, templateVars) {
  const templateStringWithThis = templateString.replace("${", "${this.");
  return new Function("return `" + templateStringWithThis + "`;").call(
    templateVars
  );
}

function sanatize(inputObj) {
  const dangereousShellCharacters = /["$&'()*;<>?[\\\]`{|}~\s]/g;
  const sanatizeInput = (str) => str.replace(dangereousShellCharacters, "");

  return Object.keys(inputObj).reduce((acc, key) => {
    acc[key] = sanatizeInput(inputObj[key]);
    return acc;
  }, {});
}
