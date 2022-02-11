import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "../../hooks/localStorage";

export const LogOutPage = () => {
  const [user, setUser] = useLocalStorage("currentUser", "");
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setUser(null);
      alert("Logged out!");
      return navigate("/");
    }
    return navigate("/login");
  });

  return <></>;
};
