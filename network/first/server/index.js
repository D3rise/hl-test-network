const http = require("http");
const profiles = require("./profiles/profiles");

const HOST = "0.0.0.0";
const PORT = "3000";

const main = async () => {
  const [ca, gateway] = await profiles.usersProfile();
  const network = await gateway.getNetwork("wsr");
  const chaincode = await network.getContract("basic");

  const listener = async (req, res) => {
    res.setHeader("Content-Type", "application/json");

    // get body of request (raw)
    const buffers = [];
    for await (const chunk of req) {
      buffers.push(chunk);
    }
    const body = JSON.parse(Buffer.concat(buffers).toString());

    // get necessary values from body
    let { Function, Args } = body;
    let result;

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
      }
    } catch (e) {
      res.writeHead(500);
      console.log(e);
      res.end(JSON.stringify({ error: e.message }));
    }
  };

  const server = http.createServer(listener);
  server.listen(PORT, HOST);
};

if (require.main == module) {
  main();
}
