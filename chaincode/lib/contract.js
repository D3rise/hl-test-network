const { Contract } = require("fabric-contract-api");
const crypto = require("crypto");

module.exports = class ShopManagerContract extends Contract {
  constructor() {
    super("shop-manager");
  }

  async InitLedger(ctx) {
    const bank = {
      username: "bank",
      secretHash: crypto.createHash("sha3-256").update("123123").digest("hex"),
      balance: 10000,
      moneyRequests: [],
    };

    const shops = [
      {
        city: "Dmitrov",
        balance: 1000,
        secretHash: crypto
          .createHash("sha3-256")
          .update("123123")
          .digest("hex"),
      },
    ];

    const elevateRequests = [];
    const reviews = [];

    const users = [
      {
        username: "ivan",
        fullName: "Ivanov Ivan Ivanovich",
        secretHash: crypto.createHash("sha3-256").update("123").digest("hex"),
        maxRole: 2,
        currentRole: 2,
        shop: null,
        balance: 50,
      },
      {
        username: "semen",
        fullName: "Semenov Semen Semenovich",
        secretHash: crypto.createHash("sha3-256").update("123").digest("hex"),
        maxRole: 1,
        currentRole: 1,
        shop: "Dmitrov",
        balance: 70,
      },
      {
        username: "petr",
        fullName: "Petrov Petr Petrovich",
        secretHash: crypto.createHash("sha3-256").update("123").digest("hex"),
        maxRole: 0,
        currentRole: 0,
        shop: null,
        balance: 80,
      },
    ];

    await this.PutState(ctx, "users", users);
    await this.PutState(ctx, "bank", bank);
    await this.PutState(ctx, "shops", shops);
    await this.PutState(ctx, "reviews", reviews);
    await this.PutState(ctx, "elevateRequests", elevateRequests);

    return true;
  }

  async ChangeCurrentRole(ctx, newRole) {
    const [mspid, username, userid] = await this.GetCurrentID(ctx);
    const users = await this.GetState(ctx, "users");
    let roleID;

    switch (newRole) {
      case "ADMIN":
        roleID = 2;
        break;
      case "CASHIER":
        roleID = 1;
        break;
      case "BUYER":
        roleID = 0;
        break;

      default:
        throw new Error("Wrong role!");
    }

    if (users[userid].maxRole < roleID)
      throw new Error(`You can't change your role to ${newRole}`);

    users[userid].currentRole = roleID;
    await this.PutState(ctx, "users", users);

    return roleID;
  }

  async RegisterUser(ctx, username, fullName, secret) {
    const users = await this.GetState(ctx, "users");

    const exists = !!users.find((u) => u.username === username);
    if (exists) throw new Error("User with this username already exists!");

    const user = {
      username,
      fullName,
      secretHash: crypto.createHash("sha3-256").update(secret).digest("hex"),
      maxRole: 0,
      currentRole: 0,
      shop: null,
      balance: 0,
    };

    users.push(user);
    await this.PutState(ctx, "users", users);
    return user;
  }

  async LogIn(ctx, secret) {
    const [mspid, login, id] = await this.GetCurrentID(ctx);
    const secretHash = crypto
      .createHash("sha3-256")
      .update(secret)
      .digest("hex");

    switch (mspid) {
      case "BankMSP":
        const bank = await this.GetState(ctx, "bank");
        return secretHash === bank.secretHash;
      case "UsersMSP":
        const users = await this.GetState(ctx, "users");
        return secretHash === users[id].secretHash;
      case "ShopsMSP":
        const shops = await this.GetState(ctx, "shops");
        const shop = shops.find(
          (s) => s.city.toLowerCase() === login.toLowerCase()
        );
        return secretHash === shop.secretHash;
      default:
        throw new Error("Unknown MSP!");
    }
  }

  async GetState(ctx, key) {
    return JSON.parse(Buffer.from(await ctx.stub.getState(key)).toString());
  }

  PutState(ctx, key, newValue) {
    return ctx.stub.putState(key, Buffer.from(JSON.stringify(newValue)));
  }

  async GetCurrentID(ctx) {
    const mspid = ctx.clientIdentity.getMSPID();
    const username = ctx.clientIdentity.getID().split("::")[1].split("CN=")[1];
    const users = JSON.parse(
      Buffer.from(await ctx.stub.getState("users")).toString()
    );
    const id = users.findIndex((u) => u.username === username);

    return [mspid, username, id];
  }
};
