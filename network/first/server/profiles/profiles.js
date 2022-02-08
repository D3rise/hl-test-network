const fs = require("fs");
const fabricCA = require("fabric-ca-client");
const fabric = require("fabric-network");
const { User } = require("fabric-common");
const { connect, convertToX509 } = require("../wallet");
const { request } = require("http");

const connectionProfile = async () =>
  JSON.parse((await fs.promises.readFile("./profiles/cp.json")).toString());

const getUsersAdminGateway = async () => {
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
  return network;
};

const getUsersCA = async () => {
  const profile = await connectionProfile();
  return new fabricCA(profile["certificateAuthorities"]["ca-org1"]);
};

const getShopsCA = async () => {
  const profile = await connectionProfile();
  return new fabricCA(profile["certificateAuthorities"]["ca-org2"]);
};

const getBankCA = async () => {
  const profile = await connectionProfile();
  return new fabricCA(profile["certificateAuthorities"]["ca-org3"]);
};

const getCA = async (mspid) => {
  let ca;
  switch (mspid) {
    case "UsersMSP":
      ca = await getUsersCA();
      break;
    case "ShopsMSP":
      ca = await getShopsCA();
      break;
    case "BankMSP":
      ca = await getBankCA();
      break;
    default:
      throw new Error(
        "Unrecognized MSPID! Must be UsersMSP, ShopsMSP or BankMSP"
      );
  }

  return ca;
};

const enroll = async (mspid, username, secret) => {
  const wallet = await connect();
  if (await wallet.get(username)) await wallet.remove(username);

  const ca = await getCA(mspid);
  const user = await ca.enroll({
    enrollmentID: username,
    enrollmentSecret: secret,
  });

  await wallet.put(username, convertToX509(mspid, user));
  return user;
};

const registerAndEnroll = async (mspid, username, secret) => {
  const wallet = await connect();
  if (await wallet.get(username))
    throw new Error("User with this username already exists!");

  const ca = await getCA(mspid);

  const admin = await ca.enroll({
    enrollmentID: "admin",
    enrollmentSecret: "adminpw",
  });
  const password = await ca.register(
    {
      enrollmentID: username,
      enrollmentSecret: secret,
      maxEnrollments: -1,
    },
    User.createUser(
      "admin",
      "adminpw",
      mspid,
      admin.certificate,
      admin.key.toBytes().toString()
    )
  );
  const user = await ca.enroll({
    enrollmentID: username,
    enrollmentSecret: secret,
  });

  await wallet.put(username, convertToX509(mspid, user));
  return password;
};

const getGateway = async (username) => {
  const profile = await connectionProfile();
  const wallet = await connect();
  if (!(await wallet.get(username)))
    throw new Error("This user is not logged in!");

  const gateway = new fabric.Gateway();
  await gateway.connect(profile, {
    identity: username,
    wallet,
    discovery: { enabled: true },
  });
  return gateway;
};

module.exports = {
  getUsersAdminGateway,
  getCA,
  getGateway,
  enroll,
  registerAndEnroll,
};
