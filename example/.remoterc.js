module.exports = {
  port: 2020,
  access_key: "my-secret",
  commands: {
    // Arguments are always escaped
    checkout: { cmd: "git checkout '${branch}'" },
    pull: { cmd: "git pull origin '${branch}'" },
  },
  webhook: {
    label: "preview",
  },
};
