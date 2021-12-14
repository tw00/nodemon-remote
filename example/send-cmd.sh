#!/bin/bash

curl -i -X POST \
  http://localhost:2020/  \
  -H "Authorization: BEARER my-secret" \
  -d '{ "cmd": "checkout", "branch": "main" }'

curl -i -X POST \
  http://localhost:2020/  \
  -H "Authorization: BEARER my-secret" \
  -d '{ "cmd": "nodemon:restart" }'