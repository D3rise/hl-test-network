import { Routes, Route } from "react-router-dom";
import { Header } from "./components/header";
import { Context } from "./hooks/context";
import { LoginPage } from "./pages/login/login";

function App() {
  return (
    <Context.Provider value={{ who: "ami" }}>
      <Header />
      <Routes>
        <Route path="/login" index={true} element={<LoginPage />} />
      </Routes>
    </Context.Provider>
  );
}

export default App;
