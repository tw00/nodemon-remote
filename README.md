# Nodemon-Remote

Drop-in replacement for [nodemon](https://nodemon.io/) with HTTP remote control and support for custom commands.

## How to use it

### Installation

```bash
npm install --save nodemon-remote
```

### Create a config: `.remoterc.js`

```js
module.exports = {
  port: 2020,
  access_key: "MY_SECRET_ACCESS_KEY",
  commands: {
    // Custom commands (arguments are always escaped)
    checkout: { cmd: "git checkout '${branch}'" },
    pull: { cmd: "git pull origin '${branch}'" },
  },
};
```

### Send nodemon restart command

```bash
curl -X POST \
  http://<endpoint>:2020/
  --header "Authorization: BEARER <MY_SECRET_ACCESS_KEY>" \
  --data '{ "cmd": "nodemon:restart" }'
```

### Send custom remote command

```bash
curl -X POST \
  http://<endpoint>:2020/
  --header "Authorization: BEARER <MY_SECRET_ACCESS_KEY>" \
  --data '{ "cmd": "checkout", "branch": "main" }'
```

### Github Webhook Integration (TBD)

```
http://<endpoint>:2020/webhook
```

![](./img/webhook-config.png)

