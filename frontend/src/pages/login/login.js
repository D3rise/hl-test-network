import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { USERS_MSPID, SERVER_URL } from "../../common/constant";
import { useLocalStorage } from "../../hooks/localStorage";

export const LoginPage = () => {
  const defaultState = {
    username: "",
    password: "",
    secret: "",
  };

  const [state, setState] = useState(defaultState);
  const [username, setUsername] = useLocalStorage("currentUser", "");
  const navigate = useNavigate();

  useEffect(() => {
    if (username !== "") return navigate("/");
  }, [username, navigate]);

  const setAuth = (key, value) => {
    setState((prev) => {
      return { ...prev, [key]: value };
    });
  };

  const auth = async (e) => {
    e.preventDefault();
    const { username, password, secret } = state;

    try {
      const enroll = await fetch(SERVER_URL + "/enroll", {
        method: "POST",
        body: JSON.stringify({
          mspid: USERS_MSPID,
          username,
          secret: password,
        }),
      }).then((res) => res.json());
      if (enroll.error) throw new Error(enroll.error);

      const authenticate = await fetch(SERVER_URL + "/query", {
        method: "POST",
        headers: { Authorization: `User ${username}` },
        body: JSON.stringify({
          Function: "AuthenticateCurrentUser",
          Args: [secret],
        }),
      }).then((res) => res.json());
      if (authenticate.error) throw new Error(authenticate.error);
    } catch (e) {
      console.log(e);
      return alert(e);
    }

    setUsername(username);
    alert(`Successfully authenticated as ${username}!`);
    navigate("/");
  };

  return (
    <div className="auth">
      <form onSubmit={auth}>
        <label>
          Username:
          <input
            type="text"
            onChange={(e) => setAuth("username", e.target.value)}
          ></input>
          <br />
          Password:
          <input
            type="text"
            onChange={(e) => setAuth("password", e.target.value)}
          ></input>
          <br />
          Secret:
          <input
            type="text"
            onChange={(e) => setAuth("secret", e.target.value)}
          ></input>
          <br />
        </label>
        <button type="submit">Log In</button>
      </form>
    </div>
  );
};
