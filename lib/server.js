const http = require("http");
const logger = require("debug")("remote");
const webhookReq = require("./webhook");
const remoteReq = require("./remote");
const config = require("./config");

module.exports = function createRemoteServer(options) {
  const server = http.createServer(
    makeRequestListener({
      handleWebhookRequest: (req) => webhookReq(req, options),
      handleRequest: (req) => remoteReq(req, options),
    })
  );
  logger(`listening on port ${config.port}`);
  server.listen(config.port);
};

function makeRequestListener(options) {
  const { handleWebhookRequest, handleRequest } = options;
  return async function (req, res) {
    try {
      const { url, method } = req;
      req.body = await parseBodyJSON(req);
      checkAuthorization(req);

      logger("req: %o", {
        url,
        method,
        body: req.body,
      });

      if (url === "/webhook") {
        const response = await handleWebhookRequest(req);
        respondJSON(res, 200, response);
      } else if (url === "/") {
        const response = await handleRequest(req);
        respondJSON(res, 200, response);
      } else {
        respondJSON(res, 404, { status: "Unknown route" });
      }
    } catch (error) {
      respondJSON(res, 400, {
        status: "Invalid request",
        message: error.message,
      });
    }
  };
}

function checkAuthorization(req) {
  const authorizationHeader = req.headers["authorization"] || "";
  const token = authorizationHeader.replace(/^Bearer\s+/i, "");
  if (token !== config.access_key) {
    throw new Error("Unauthorized");
  }
}

async function parseBodyJSON(req) {
  return new Promise(function (resolve, reject) {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("error", reject);
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
}

function respondJSON(res, statusCode, message) {
  return res
    .writeHead(statusCode, { "Content-Type": "application/json" })
    .end(JSON.stringify(message, null, 2));
}
