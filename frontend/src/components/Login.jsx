import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";

export default function Login() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * Validate user inputs
   */
  const validateInput = () => {
    if (!email.trim()) {
      message.error("Email is a required field");
      return false;
    }

    if (!password.trim()) {
      message.error("Password is a required field");
      return false;
    }

    return true;
  };

  /**
   * Validate API response
   */
  const validateResponse = (errored, response) => {
    if (errored || (!response?.tokens && !response?.message)) {
      message.error(
        "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    }

    if (!response.tokens) {
      message.error(response.message);
      return false;
    }

    return true;
  };

  /**
   * Login API Call
   */
  const performAPICall = async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      const res = await fetch(`${config.endpoint}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      response = await res.json();
    } catch (error) {
      errored = true;
      console.error(error);
    } finally {
      setLoading(false);
    }

    if (validateResponse(errored, response)) {
      return response;
    }

    return null;
  };

  /**
   * Store login data
   */
  const persistLogin = (token, email, balance, name, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("balance", balance);
    localStorage.setItem("username", name);
    localStorage.setItem("userId", userId);
  };

  /**
   * Login Handler
   */
  const login = async () => {
    if (!validateInput()) return;

    const response = await performAPICall();

    if (!response) return;

    persistLogin(
      response.tokens.access.token,
      response.user.email,
      response.user.walletMoney,
      response.user.name,
      response.user._id
    );

    setEmail("");
    setPassword("");

    message.success("Logged in successfully");

    navigate("/products");
  };

  return (
    <>
      {/* Header */}
      <Header navigate={navigate} />

      {/* Login Form */}
      <div className="flex-container">
        <div className="login-container container">
          <h1>Login to QKart</h1>

          <Input
            className="input-field"
            prefix={<UserOutlined />}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input.Password
            className="input-field"
            prefix={<LockOutlined />}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={login}
          />

          <Button
            type="primary"
            loading={loading}
            onClick={login}
            block
          >
            Login
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}