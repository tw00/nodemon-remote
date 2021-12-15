module.exports = {
  port: 2020,
  access_key: "my-secret",
  responseIncludeStdout: true,
  commands: {
    // Arguments are always escaped
    checkout: { cmd: "git checkout '${branch}'" },
    pull: { cmd: "git pull origin '${branch}'" },
    fetchAll: { cmd: "git fetch --all" },
  },
  webhook: {
    label: "preview",
    cmd: [
      "git fetch --all",
      "git checkout '${ref}'",
      "npm ci",
      "nodemon:restart",
    ],
  },
};
