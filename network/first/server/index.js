const http = require("http");
const profiles = require("./profiles/profiles");

const HOST = "0.0.0.0";
const PORT = "3000";
const CHAINCODE_NAME = "shop-manager";
const CHANNEL_NAME = "wsr";

const main = async () => {
  const gateway = await profiles.getUsersAdminGateway();
  const network = await gateway.getNetwork(CHANNEL_NAME);
  let chaincode;

  const listener = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Request-Method", "*");
    res.setHeader("Access-Control-Allow-Methods", "OPTIONS, POST");
    res.setHeader("Access-Control-Allow-Headers", "*");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      return res.end();
    }

    // get body of request (raw)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    console.log(Buffer.concat(buffers).toString());
    const body = JSON.parse(Buffer.concat(buffers).toString());
    console.log(body);

    // get necessary values from body
    let { Function, Args, username, secret, mspid } = body;
    let result;

    if (req.headers.authorization) {
      try {
        const username = req.headers.authorization.split(" ")[1];
        chaincode = await profiles
          .getGateway(username)
          .then((g) => g.getNetwork(CHANNEL_NAME))
          .then((n) => n.getContract(CHAINCODE_NAME));
      } catch (e) {
        res.writeHead(403);
        return res.end(JSON.stringify({ error: "User is not logged in!" }));
      }
    } else {
      chaincode = network.getContract(CHAINCODE_NAME);
    }

    try {
      switch (req.url) {
        // evaluate transaction (does not modify ledger)
        case "/query":
          result = await chaincode.evaluateTransaction(
            Function,
            ...(Args ? Args : [])
          );
          res.end(JSON.stringify(result.toString()));
          break;

        // invoke transaction (modifies ledger)
        case "/invoke":
          result = await chaincode.submitTransaction(
            Function,
            ...(Args ? Args : [])
          );
          res.end(JSON.stringify(result.toString()));
          break;

        case "/enroll":
          await profiles.enroll(mspid, username, secret);
          res.end(JSON.stringify({ result: true, username }));
          break;

        case "/registerAndEnroll":
          await profiles.registerAndEnroll(mspid, username, secret);
          res.end(JSON.stringify({ result: true, username }));
          break;

        default:
          res.writeHead(404);
          res.end(JSON.stringify({ error: "Not found" }));
      }
    } catch (e) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: e.message }));
      console.log(e);
    }
  };

  const server = http.createServer(listener);
  server.listen(PORT, HOST);
  console.log("Listening on %s:%d", HOST, PORT);
};

if (require.main == module) {
  main();
}
