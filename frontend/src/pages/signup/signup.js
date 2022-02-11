import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SERVER_URL } from "../../common/constant";
import { useLocalStorage } from "../../hooks/localStorage";

export const SignUpPage = () => {
  const defaultState = {
    username: "",
    fullName: "",
    password: "",
    secret: "",
  };
  const navigate = useNavigate();
  const [state, setState] = useState(defaultState);
  const [user, setUser] = useLocalStorage("currentUser", "");

  useEffect(() => {
    if (user !== "") return navigate("/");
  }, [navigate, user]);

  const setAuth = (key, value) => {
    setState((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const signUp = async (e) => {
    e.preventDefault();
    const { username, fullName, password, secret } = state;

    try {
      await fetch(SERVER_URL + "/registerAndEnroll", {
        method: "POST",
        body: JSON.stringify({
          mspid: "UsersMSP",
          username,
          secret: password,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.error) throw new Error(res.error);
        });

      await fetch(SERVER_URL + "/invoke", {
        method: "POST",
        headers: {
          Authorization: `User ${username}`,
        },
        body: JSON.stringify({
          Function: "RegisterCurrentUser",
          Args: [fullName, secret],
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.error) throw new Error(res.error);
        });
    } catch (e) {
      alert(e.message);
      setState(defaultState);
      return;
    }

    setUser(username);
    alert("Successfully registered and logged in as " + username);
    navigate("/");
  };

  return (
    <div className="signup">
      <form onSubmit={signUp}>
        <label>
          Full Name:
          <input
            type="text"
            onChange={(e) => setAuth("fullName", e.target.value)}
          />
          <br />
        </label>
        <label>
          Username:
          <input
            type="text"
            onChange={(e) => setAuth("username", e.target.value)}
          />
          <br />
        </label>
        <label>
          Password:
          <input
            type="text"
            onChange={(e) => setAuth("password", e.target.value)}
          />
          <br />
        </label>
        <label>
          Secret:
          <input
            type="text"
            onChange={(e) => setAuth("secret", e.target.value)}
          />
          <br />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};
