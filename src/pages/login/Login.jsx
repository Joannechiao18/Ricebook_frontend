import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./login.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import styled from "styled-components";
import { AuthContext } from "../../context/authContext";
import DatePicker from "react-datepicker";
import { useDispatch } from "react-redux";
import { login } from "../../actions/authActions"; // Assuming you've stored it in an 'actions' folder
import GoogleIcon from "@mui/icons-material/Google";
// Styled Components for the buttons
const LoginButton = styled.button`
  background-color: #938eef;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";

  &:hover {
    background-color: #7a75d6;
    animation: pulse 0.6s infinite;
  }
`;

const RegisterButton = styled(LoginButton)`
  background-color: #e3e0e0;
  color: black;

  &:hover {
    background-color: #dedada;
  }
`;

const ThirdPartyLoginButton = styled(LoginButton)`
  background-color: #3b5998; // Adjust the color as needed
  margin-right: 20px; // Increase the margin for a larger gap

  &:hover {
    background-color: #324c85; // Adjust the hover color as needed
  }
`;

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(""); // State to store login error message
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleThirdPartyLogin = () => {
    window.location.href =
      "https://ricebookserveryw187-8fbcb305db50.herokuapp.com/auth/google/callback";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check for username and password only if the standard login button was clicked
    if (
      e.nativeEvent.submitter ===
        document.getElementById("standardLoginButton") &&
      (!username || !password)
    ) {
      setLoginError("Username and password are required.");
      return;
    }
    try {
      const loginResponse = await fetch(
        "https://ricebookserveryw187-8fbcb305db50.herokuapp.com/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
          credentials: "include",
        }
      );

      const loginData = await loginResponse.json();
      if (loginResponse.ok) {
        // Fetch avatar
        const avatarResponse = await fetch(
          `https://ricebookserveryw187-8fbcb305db50.herokuapp.com/avatar/${username}`,
          {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        let avatarUrl = null;
        if (avatarResponse.ok) {
          const avatarData = await avatarResponse.json();
          avatarUrl = avatarData.avatar;
        }

        // Update Redux store with user data and avatar
        dispatch(login({ ...loginData, avatar: avatarUrl })); // Assuming your login action can handle this data structure
        navigate("/");
      } else {
        console.error("Login error:", loginData.error);
        setLoginError(loginData.error || "Invalid login credentials");
      }
    } catch (error) {
      console.error("Network error:", error);
      setLoginError("Network error. Please try again later.");
    }
  };

  return (
    <div className="register d-flex align-items-center vh-100">
      <div className="card mx-auto" style={{ maxWidth: "800px" }}>
        <div className="row g-0">
          <div className="col-md-6 d-flex flex-column justify-content-center align-items-center p-5 text-white bg-primary">
            <h2 className="display-1 mb-4">Hello World.</h2>
            <span className="mb-3">First time?</span>
            <Link to="/register">
              <RegisterButton>Register</RegisterButton>
            </Link>
          </div>
          <div className="col-md-6 d-flex flex-column justify-content-center p-5">
            <h2 className="mb-4">Login</h2>
            {loginError && (
              <div className="alert alert-danger" role="alert">
                {loginError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control w-100"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <input
                  type="password"
                  className="form-control w-100"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <ThirdPartyLoginButton
                    type="button"
                    onClick={handleThirdPartyLogin}
                  >
                    <GoogleIcon>&#xe8d4;</GoogleIcon> Login with Google
                  </ThirdPartyLoginButton>
                </div>
                <div>
                  <LoginButton id="standardLoginButton" type="submit">
                    Login
                  </LoginButton>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
