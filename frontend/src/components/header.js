import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <div className="header">
      <h1>Shop Manager</h1>
      <br />
      <ul>
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
