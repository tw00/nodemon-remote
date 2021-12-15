const config = require("./config");
const { handleCmd } = require("./remote");

async function handleWebhookRequest({ body }, context) {
  if (body.action !== "synchronize" && body.action !== "opened") {
    return { status: "IrrelevantAction" };
  }

  if (!body.pull_request) {
    return { status: "NotPullRequestWebhook" };
  }

  const hasMagicLabel = body.pull_request.labels.find(
    (label) => label.name === config.webhook.label
  );

  if (!hasMagicLabel) {
    return { status: "MagicLabelNotPresent" };
  }

  const templateVars = {
    ref: body.pull_request.head.ref,
    sha: body.pull_request.head.sha,
    default: body.repository.default_branch,
    repoName: body.repository.name,
  };

  return handleCmd(config.webhook.cmd, templateVars, context);
}

module.exports = {
  handleWebhookRequest,
};
