import { useState, useEffect, useRef } from "react";
import {
  FiBell,
  FiMenu,
  FiInfo,
  FiLogOut,
  FiUser,
  FiChevronDown,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";

import useAuthStore from "../../../auth/store/authStore";
import "./Header.css";

function Header({ setMobileOpen }) {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const displayName =
    user?.EmployeeName || user?.name || "Admin User";

  const handleDeveloperInfo = () => {
    navigate("/developerInfo");
  };

 const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
};

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  return (
    <header className="hrms-header">
      <div className="header-left">
        <div className="company-brand">
          <div className="company-logo-wrapper">
            <img
              src="/CompanyLogo.png"
              alt="Company Logo"
              className="company-logo"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>

      <div className="header-right">
        {/* Mobile menu */}
        <button
          type="button"
          className="mobile-header-menu"
          onClick={() => setMobileOpen?.(true)}
          aria-label="Open menu"
          title="Menu"
        >
          <FiMenu size={21} />
        </button>

        {/* Developer info */}
        <button
          type="button"
          className="header-icon-button"
          onClick={handleDeveloperInfo}
          title="Developer Info"
          aria-label="Developer Info"
        >
          <FiInfo size={20} />
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="header-icon-button"
          title="Notifications"
          aria-label="Notifications"
        >
          <FiBell size={20} />
          <span className="notification-indicator" />
        </button>

        {/* Profile dropdown */}
        <div className="header-profile-container" ref={profileRef}>
          <button
            type="button"
            className="header-profile-button"
            onClick={() => setProfileOpen((previous) => !previous)}
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
            title={displayName}
          >
            <img
              src="/default-profile.png"
              alt=""
              className="header-profile-photo"
            />

            <FiChevronDown
              className={`profile-chevron ${
                profileOpen ? "profile-chevron-open" : ""
              }`}
              size={15}
            />
          </button>

          {profileOpen && (
            <div className="header-profile-dropdown">
              <div className="profile-dropdown-user">
                <div className="profile-dropdown-avatar">
                  <FiUser size={19} />
                </div>

                <div className="profile-dropdown-details">
                  <span className="profile-dropdown-name">
                    {displayName}
                  </span>

                  <span className="profile-dropdown-role">
                    {user?.role || "User"}
                  </span>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-dropdown-logout"
                onClick={handleLogout}
              >
                <FiLogOut size={17} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;