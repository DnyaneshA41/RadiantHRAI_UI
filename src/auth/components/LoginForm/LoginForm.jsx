import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useLogin from "../../hooks/useLogin";

import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import "./LoginForm.css";
import productLogo from "../../../assets/logo.png";
import useAuthStore from "../../store/authStore";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login: loginApiCall, loading, error } = useLogin();
  const login = useAuthStore((state) => state.login);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    clientId: import.meta.env.VITE_CLIENT_ID,
    id: "",
    pass: "",
    sourceID: "",
    isweb: true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.id || !formData.pass) {
        return;
    }

    const response = await loginApiCall({
        clientId: formData.clientId,
        id: formData.id,
        pass: formData.pass,
        sourceID: formData.sourceID,
    });

    if (!response) {
        return;
    }

    // Support both Axios response and direct API response
    const result = response?.data ?? response;

    // Extract actual API response properties
    const user = result?.User;
    const token = result?.Token;

    if (!user || !token) {
        console.error("Invalid login response:", result);
        return;
    }

    // Save user and menus in Zustand
    login(
        {
            ...user,
            id: formData.id,
        },
        token
    );

    navigate("/dashboard", {
        replace: true,
    });
};

  return (
    <div className="login-form-wrapper">
      <h1>Welcome!</h1>

      <p className="subtitle">Sign in to your Account</p>

      <form onSubmit={handleSubmit}>
        {/* Username */}
        <div className="input-group">
          <span className="input-icon">
            <FiUser />
          </span>

          <input
            type="text"
            name="id"
            placeholder="Enter Username"
            value={formData.id}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="input-group">
          <span className="input-icon">
            <FiLock />
          </span>

          <input
            type={showPassword ? "text" : "password"}
            name="pass"
            placeholder="Enter Password"
            value={formData.pass}
            onChange={handleChange}
          />

          <button
            type="button"
            className="eye-btn"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="forgot-password">
          <a href="#">Forgot Password?</a>
        </div>

        {/* Login Button */}
        {error && (
    <p className="login-error">
        {error}
    </p>
)}
        <div className="button-group">
          <button type="submit" className="signin-btn" disabled={loading}>
            {loading ? "SIGNING IN..." : "SIGN IN"}
          </button>
        </div>

        {/* Download Apps */}
        <div className="divider">DOWNLOAD OUR APP</div>

        <div className="store-buttons">
          <a
            href="https://play.google.com/store/apps/details?id=com.radiantHR"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
              alt="Google Play"
            />
          </a>

          <a
            href="https://apps.apple.com/in/app/radianthr/id6752555816"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
              alt="App Store"
            />
          </a>
        </div>

        {/* Company Footer */}
        <div className="login-footer">
          <img
            src={productLogo}
            alt="RadiantHR Logo"
            className="our-company-logo"
          />

          <p className="footer-text">
            RadiantHR Powered By
            <br />
            Trilliant Software Pvt. Ltd
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
