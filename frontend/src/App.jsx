import {Route, Routes} from "react-router-dom";
import React, {useEffect, useState} from "react";
import FabricCA from "fabric-ca-client"
import { Context } from "./context";
import {Login} from "./page/login/Login";
import {Home} from "./page/home/home";
import {Gateway, Wallets} from "fabric-network";
import * as path from "path";
import * as fs from "fs";
import {convertToX509} from "./caUtil";

const App = () => {
  const [state, setState] = useState({});
  const bankGateway = new Gateway();
  const usersGateway = new Gateway();
  const shopsGateway = new Gateway();

  let bankCA, usersCA, shopsCA;

  useEffect(async () => {
      const bankWallet = await Wallets.newFileSystemWallet(path.resolve(__dirname, "..", "wallets", "bank"))
      const usersWallet = await Wallets.newFileSystemWallet(path.resolve(__dirname, "..", "wallets", "users"))
      const shopsWallet = await Wallets.newFileSystemWallet(path.resolve(__dirname, "..", "wallets", "shops"))

      const bankCP = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'BankCP.json')).toString())
      const usersCP = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'UsersCP.json')).toString())
      const shopsCP = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'ShopsCP.json')).toString())

      const bankCAProfile = bankCP.certificateAuthorities["bankca-api.127-0-0-1.nip.io:8080"]
      bankCA = new FabricCA(bankCAProfile.url);

      const usersCAProfile = usersCP.certificateAuthorities["usersca-api.127-0-0-1.nip.io:8080"]
      usersCA = new FabricCA(usersCAProfile.url);

      const shopsCAProfile = shopsCP.certificateAuthorities["shopsca-api.127-0-0-1.nip.io:8080"]
      shopsCA = new FabricCA(shopsCAProfile.url);

      await bankGateway.connect(bankCP, { wallet: bankWallet, identity: "admin" })
      const bankAdmin = await bankCA.enroll({ enrollmentID: "admin", enrollmentSecret: "adminpw" })
      await bankWallet.put("admin", convertToX509(bankAdmin, "BankMSP"))

      await usersGateway.connect(usersCP, { wallet: usersWallet, identity: "admin" }) // ivan is admin
      const usersAdmin = await usersCA.enroll({ enrollmentID: "admin", enrollmentSecret: "adminpw" })
      await usersWallet.put("admin", convertToX509(usersAdmin, "UsersMSP"))

      await shopsGateway.connect(shopsCP, { wallet: shopsWallet, identity: "admin" })
      const shopsAdmin = await shopsCA.enroll({ enrollmentID: "admin", enrollmentSecret: "adminpw" })
      await shopsWallet.put("admin", convertToX509(shopsAdmin, "ShopsMSP"))
  }, [])

  return (
    <Context.Provider value={{ state, setState, bankCA, usersCA, shopsCA, bankGateway, usersGateway, shopsGateway }}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />}/>
        </Routes>
    </Context.Provider>
  );
};

export default App;
