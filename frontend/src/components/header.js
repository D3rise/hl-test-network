import { Link } from "react-router-dom";
import { useLocalStorage } from "../hooks/localStorage";

export const Header = () => {
  const [user] = useLocalStorage("currentUser", "");

  return (
    <div className="header">
      <h1>Shop Manager</h1>
      <h5 style={{ textAlign: "right" }}>
        {user !== "" ? (
          <>
            Current user: <strong>{user}</strong> |{" "}
            <Link to="/logout">Log Out</Link>
          </>
        ) : (
          <>Not logged in</>
        )}
      </h5>
      <br />
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/login">Log In</Link>
        </li>
        <li>
          <Link to="/signup">Sign Up</Link>
        </li>
      </ul>
    </div>
  );
};
