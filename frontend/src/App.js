import { Link } from "react-router-dom";
import { useState } from "react/cjs/react.production.min";
import { Context } from "./context";

const App = () => {
  const [state, setState] = useState({});

  return (
    <Context.Provider value={{ state, setState }}>
      <nav>
        <ul>
          <li>
            <Link to="/login">Log In</Link>
          </li>
          <li>
            <Link to="/signup">Sign Up</Link>
          </li>
        </ul>
      </nav>
    </Context.Provider>
  );
};

export default App;
