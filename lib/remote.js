const { promisify } = require("util");
const logger = require("debug")("remote");
const config = require("./config");
const exec = promisify(require("child_process").exec);

async function handleRequest({ body }, context) {
  try {
    const { cmd: cmdRef, ...templateVars } = body;

    if (!(cmdRef in config.commands)) {
      return { status: "CmdNotFound" };
    }

    const { cmd } = config.commands[cmdRef] || {};
    return await handleCmd(cmd, templateVars, context);
  } catch (error) {
    logger("failed: %s", error.message);
    return { status: "CmdExecutionFailed" };
  }
}

async function handleCmd(cmdOrCmdList, templateVars, context) {
  const cmdList = Array.isArray(cmdOrCmdList) ? cmdOrCmdList : [cmdOrCmdList];
  const resultList = [];

  for await (const cmd of cmdList) {
    if (!cmd) {
      resultList.push({ cmd, status: "CmdEmpty" });
      break;
    }

    if (await handleNodemonCommands(cmd, context)) {
      resultList.push({ cmd, status: "Success" });
      break;
    }

    const cmdInterpolated = fillTemplate(cmd, sanatize(templateVars));
    logger("executing: %s", cmdInterpolated);

    try {
      const result = await exec(cmdInterpolated);
      logger("success: %o%o", result.stdout, result.stderr);
      resultList.push({ cmd: cmdInterpolated, status: "Success" });
    } catch (error) {
      resultList.push({
        cmd: cmdInterpolated,
        status: "Failed",
        error: error.message,
      });
      break;
    }
  }

  return { status: "Success", result: resultList };
}

async function handleNodemonCommands(cmd, context) {
  const { nodemon } = context;

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

module.exports = {
  handleRequest,
  handleCmd,
};
