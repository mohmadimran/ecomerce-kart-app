import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, message } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";

export default function Register() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /**
   * Validate user input
   */
  const validateInput = () => {
    if (!username.trim()) {
      message.error("Username is a required field");
      return false;
    }

    if (username.length < 6) {
      message.error("Username must be at least 6 characters");
      return false;
    }

    if (username.length > 32) {
      message.error("Username must be at most 32 characters");
      return false;
    }

    if (!email.trim()) {
      message.error("Email is a required field");
      return false;
    }

    if (!password.trim()) {
      message.error("Password is a required field");
      return false;
    }

    if (password.length < 8) {
      message.error("Password must be at least 8 characters");
      return false;
    }

    if (password.length > 32) {
      message.error("Password must be at most 32 characters");
      return false;
    }

    if (password !== confirmPassword) {
      message.error("Passwords do not match");
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
   * Register API
   */
  const performAPICall = async () => {
    let response = {};
    let errored = false;

    setLoading(true);

    try {
      const res = await fetch(`${config.endpoint}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: username,
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
   * Register handler
   */
  const register = async () => {
    if (!validateInput()) return;

    const response = await performAPICall();

    if (!response) return;

    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");

    message.success("Registered successfully");

    navigate("/login");
  };

  return (
    <>
      {/* Header */}
      <Header navigate={navigate} />

      {/* Register Form */}
      <div className="flex-container">
        <div className="register-container container">
          <h1>Make an account</h1>

          <Input
            className="input-field"
            prefix={<UserOutlined />}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <Input
            className="input-field"
            prefix={<MailOutlined />}
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
          />

          <Input.Password
            className="input-field"
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onPressEnter={register}
          />

          <Button
            type="primary"
            loading={loading}
            onClick={register}
            block
          >
            Register
          </Button>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}