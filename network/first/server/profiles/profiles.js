const fs = require("fs");
const fabricCA = require("fabric-ca-client");
const fabric = require("fabric-network");
const { connect, convertToX509 } = require("../wallet");

const connectionProfile = async () =>
  JSON.parse((await fs.promises.readFile("./profiles/cp.json")).toString());

const usersProfile = async () => {
  const profile = await connectionProfile();
  const wallet = await connect();

  const ca = new fabricCA(profile["certificateAuthorities"]["ca-org1"]);
  const admin = await ca.enroll({
    enrollmentID: "admin",
    enrollmentSecret: "adminpw",
  });

  if (await wallet.get("admin")) await wallet.remove("admin");
  await wallet.put("admin", convertToX509("UsersMSP", admin));

  const network = new fabric.Gateway();
  await network.connect(profile, {
    identity: "admin",
    wallet,
    discovery: { enabled: true },
  });
  return [ca, network];
};

module.exports = {
  usersProfile,
};
