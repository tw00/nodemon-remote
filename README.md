# Nodemon-Remote

<p align="center">
  <img src="./img/logo.svg" alt="Nodemon-Remote Logo">
</p>

Drop-in replacement for [nodemon](https://nodemon.io/) with HTTP remote control and support for custom commands.

## Application: Emphemeral environments

- Run your node app with `nodemon-remote` in your deployed environment and instantly switch to branches and new commits without the need to re-deploy
- `nodemon-remomte` suppots Github Webhooks. Once a configurable label (`"preview"` by default) is assigned to a PR, the remote container will automatically switch to the latest commit of the corresponding branch
- ⚠️ WARNING ⚠️ Using `nodemon-remote` is potentially dagenrous. Make sure to use a strong access key and don't use `nodemon-remote` in production.

## How to use it

### Installation

```bash
npm install --save nodemon # install nodemon as peer dependency
npm install --save nodemon-remote
# or
npm install -g nodemon
npx nodemon-remote <nodemon cli arguments>
```

### Create a config: `.remoterc.js`

```js
module.exports = {
  port: 2020,
  access_key: "MY_SECRET_ACCESS_KEY",
  commands: {
    // Custom commands (arguments are always escaped)
    checkout: { cmd: "git checkout '${branch}'" },
    fetch: { cmd: "git fetch --all" },
    // Define multiple commands
    pullAndInstall: {
      cmd: [
        "git pull origin '${branch}'"
        "npm ci"
      ]
    },
  },
};
```

For safety reasons the following characters are removed from arguments:
` " $ & ' ( ) * ; < > ? [ \ ] `` { | } ~ space tab new-line `

### Send custom remote command

```bash
curl -X POST \
  http://<endpoint>:2020/
  --header "Authorization: BEARER <MY_SECRET_ACCESS_KEY>" \
  --data '{ "cmd": "checkout", "branch": "main" }'
```

### Send nodemon restart command

```bash
curl -X POST \
  http://<endpoint>:2020/
  --header "Authorization: BEARER <MY_SECRET_ACCESS_KEY>" \
  --data '{ "cmd": "nodemon:restart" }'
```

Available build-in commands:

- `nodemon:restart`: Restart nodemon
- `nodemon:reset`: Resets all settings

### Github Webhook Integration

Trigger commands based on a configurable label.

Example: Any PR that has the "preview" label assigned
and that code is pushed to will get checked out in the remote container.

```js
module.exports = {
  // ...
  webhook: {
    label: "preview",
    // Commands will run, if a PR with the label above is modified
    cmd: [
      "git fetch --all",
      "git checkout '${ref}'",
      "npm ci",
      "nodemon:restart",
    ],
  },
};
```

1. Got to webhook settings (`https://github.com/<org>/<project>/settings/hooks/new`)

2. Enter payload URL:

```
http://<endpoint>:2020/webhook
```

3. Select `application/json` and enter secret

![](./img/webhook-config.png)

4. Select `Let me select individual events.`

5. Enable `Pull requests` only

![](./img/webhook-options.png)

6. Hit `Add Webhook`

7. Assign label configured in `config.webhook.label` (e.g. `"preview"`) to PR
