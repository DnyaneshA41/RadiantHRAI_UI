import React from "react";
import { FiUsers } from "react-icons/fi";
import "./DashboardCards.css";

/* =====================================================
   DASHBOARD CARD
===================================================== */

export const DashboardCard = ({
    title = "Total Roles",
    value = 12,
    growth = "+2 this month",
    icon: Icon = FiUsers,
    color = "blue",
}) => {
    return (
        <div className="dashboard-card">
            <div className={`dashboard-card-icon ${color}`}>
                <Icon />
            </div>

            <div className="dashboard-card-content">
                <span className="dashboard-card-title">
                    {title}
                </span>

                <h3 className="dashboard-card-value">
                    {value}
                </h3>

                {growth && (
                    <span className="dashboard-card-growth">
                        <span className="growth-arrow">↑</span>
                        {growth}
                    </span>
                )}
            </div>
        </div>
    );
};

/* =====================================================
   DASHBOARD CARD GRID
===================================================== */

export const DashboardCardGrid = ({ children }) => {
    return (
        <div className="dashboard-card-grid">
            {children}
        </div>
    );
};

export default DashboardCard;