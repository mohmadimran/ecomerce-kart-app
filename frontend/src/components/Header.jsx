import { Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header({ children }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <header className="header">
      <Link className="header-title" to="/" aria-label="QKart home">
        <img src="icon.svg" alt="QKart" />
      </Link>

      {children}

      <nav className="header-action">
        {username ? (
          <>
            <img src="avatar.png" alt="" className="profile-image" />
            <div className="header-info">{username}</div>
            <Button type="primary" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link className="header-link" to="/products">
              Explore
            </Link>
            <Link className="header-link" to="/login">
              Login
            </Link>
            <Link className="header-link" to="/register">
              <Button type="primary">Register</Button>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
