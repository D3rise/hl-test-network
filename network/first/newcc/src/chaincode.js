const { Contract } = require("fabric-contract-api");
const { createHash } = require("crypto");
const { rmSync } = require("fs");

const roles = {
  ADMIN: 4,
  SHOP: 3,
  PROVIDER: 2,
  CASHIER: 1,
  BUYER: 0,
};

const createShopObj = (city, password, balance = 0, cashiers = []) => {
  return {
    city,
    balance,
    reviews: [],
    cashiers,
    pwHash: createHash("sha3-256").update(password).digest("hex"),
  };
};

const createUserObj = (username, fullName, secret, options = {}) => {
  return {
    username,
    fullName,
    reviews: [],
    secretHash: createHash("sha3-256").update(secret).digest("hex"),
    balance: options.balance ? options.balance : 0,
    role: options.role ? roles[options.role.toUpperCase()] : roles["BUYER"],
    shop: options.shop ? options.shop : "",
  };
};

const createPromotionObj = (username, requiredRole, shop = "") => {
  return {
    username,
    requiredRole,
    shop,
    date: Date.now(),
  };
};

class ShopManager extends Contract {
  constructor() {
    super("shop-manager");
  }

  async InitLedger(ctx) {
    const bank = {
      balance: 10000,
      moneyRequests: [],
    };

    const usersInitializers = [
      ["goldfish", "Goldfish", "123", { role: "BUYER", balance: 100 }],
      ["ivan", "Ivanov Ivan Ivanovich", "123", { role: "ADMIN", balance: 50 }],
      [
        "semen",
        "Semenov Semen Semonovich",
        "123",
        { role: "CASHIER", balance: 70, shop: "Dmitrov" },
      ],
      ["petr", "Petrov Petr Petrovich", "123", { balance: 80 }],
    ];
    const users = usersInitializers.map((user) => createUserObj(...user));

    const shopsInitializers = [
      ["Dmitrov", "123", 1000],
      ["Kaluga", "123", 900],
      ["Moscow", "123", 1050],
      ["Ryazan", "123", 700],
      ["Samara", "123", 2000],
      ["Saint-Petersburg", "123", 2300],
      ["Taganrog", "123", 0],
      ["Tomsk", "123", 780],
      ["Habarovsk", "123", 1500],
    ];
    const shops = shopsInitializers.map((shop) => createShopObj(...shop));

    await this.__putState(ctx, "bank", bank);
    await this.__putState(ctx, "users", users);
    await this.__putState(ctx, "shops", shops);
  }

  async AuthenticateCurrentUser(ctx, secret) {
    const id = this.__getCurrentID(ctx);
    const user = await this.__findItemInArrayByLambda(
      ctx,
      "users",
      (u) => u.username === id
    );

    if (!user) throw new Error("User not found!");
    return (
      user.secretHash === createHash("sha3-256").update(secret).digest("hex")
    );
  }

  async RegisterCurrentUser(ctx, fullName, secret) {
    const id = this.__getCurrentID(ctx);
    if (!id) throw new Error("You can't register yourself!");

    const user = await this.__findItemInArrayByLambda(
      ctx,
      "users",
      (u) => u.username === id
    );
    if (user) throw new Error("User already registered!");

    const newUser = createUserObj(id, fullName, secret);
    await this.__addItemToArray(ctx, "users", newUser);
    return newUser;
  }

  async DebugGetState(ctx, key) {
    return this.__getState(ctx, key);
  }

  async DebugGetID(ctx) {
    return this.__getCurrentID(ctx);
  }

  __putState(ctx, key, value) {
    let newValue;
    if (typeof value === "object") {
      newValue = JSON.stringify(value);
    } else {
      newValue = value;
    }

    return ctx.stub.putState(key, Buffer.from(newValue));
  }

  async __addItemToArray(ctx, key, item) {
    let newItem;
    if (typeof item === "object") {
      newItem = JSON.stringify(item);
    } else {
      newItem = item;
    }

    const array = await this.__getState(ctx, key);
    if (!array) throw new Error("There is no such array in stub!");
    array.push(newItem);
    await this.__putState(ctx, key, array);
  }

  __findItemInArrayByLambda(ctx, key, findLambda) {
    return this.__getState(ctx, key).then((users) => users.find(findLambda));
  }

  async __getState(ctx, key) {
    const result = Buffer.from(await ctx.stub.getState(key)).toString();
    return result ? JSON.parse(result) : null;
  }

  __getCurrentID(ctx) {
    return ctx.clientIdentity.getAttributeValue("hf.EnrollmentID");
  }
}

exports.contracts = [ShopManager];
