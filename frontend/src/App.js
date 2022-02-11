import { Routes, Route } from "react-router-dom";
import { Header } from "./components/header";
import { Context } from "./hooks/context";
import { IndexPage } from "./pages/index";
import { LoginPage } from "./pages/login/login";
import { SignUpPage } from "./pages/signup/signup";

function App() {
  return (
    <Context.Provider value={{ who: "ami" }}>
      <Header />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/" index={true} element={<IndexPage />} />
      </Routes>
    </Context.Provider>
  );
}

export default App;
