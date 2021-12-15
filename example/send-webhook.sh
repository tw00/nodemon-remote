#!/bin/bash

curl -i -X POST \
  http://localhost:2020/webhook  \
  -H "Authorization: BEARER my-secret" \
  --data-binary "@../tests/pull_request.webhook.json"
