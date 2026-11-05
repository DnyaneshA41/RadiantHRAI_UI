import { useMemo, useState } from "react";
import {
  FiPlus,
  FiCalendar,
  FiClock,
  FiInfo,
} from "react-icons/fi";

import LeaveRequestForm from "../../components/Forms/Leave/LeaveRequestForm";
import "./LeaveDashboard.css";

const LEAVE_TYPES = [
  { name: "Casual Leave", balance: 300, unit: "hours" },
  { name: "Sick Leave", balance: 120, unit: "hours" },
  { name: "Earned Leave", balance: 15, unit: "days" },
  { name: "Comp Off", balance: 2, unit: "days" },
];

const INITIAL_REQUESTS = [
  {
    id: 1,
    type: "Casual Leave",
    from: "2026-10-19",
    to: "2026-10-19",
    duration: "1 day",
    reason: "Personal work",
    status: "Pending",
  },
  {
    id: 2,
    type: "Sick Leave",
    from: "2026-10-12",
    to: "2026-10-13",
    duration: "2 days",
    reason: "Not feeling well",
    status: "Approved",
  },
];

const WEEKLY_PATTERN = [
  { day: "Mon", value: 2 },
  { day: "Tue", value: 0 },
  { day: "Wed", value: 0 },
  { day: "Thu", value: 0 },
  { day: "Fri", value: 2 },
  { day: "Sat", value: 0 },
  { day: "Sun", value: 0 },
];

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function LeaveDashboard() {
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Summary");
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const pendingRequests = useMemo(
    () => requests.filter((item) => item.status === "Pending"),
    [requests]
  );

  const openLeaveForm = () => {
    setShowLeaveForm(true);
  };

  const closeLeaveForm = () => {
    setShowLeaveForm(false);
  };

  const handleAddRequest = (newRequest) => {
    setRequests((previous) => [newRequest, ...previous]);
    setShowLeaveForm(false);
    setActiveTab("Requests");
  };

  return (
    <div className="leave-dashboard-page">
      {/* PAGE HEADER */}
      <div className="leave-page-header">
        <div className="leave-dashboard-tabs">
          {["Summary", "Requests"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="hrms-form-button hrms-form-button-primary"
          onClick={openLeaveForm}
        >
          <FiPlus size={17} />
          Add Leave
        </button>
      </div>

      {/* SUMMARY TAB */}
      {activeTab === "Summary" && (
        <>
          {/* PENDING REQUESTS */}
          <section className="leave-dashboard-section">
            <div className="leave-section-heading">
              <h3>Pending leave requests</h3>

              <button
                type="button"
                className="leave-text-link"
                onClick={() => setActiveTab("Requests")}
              >
                View all
              </button>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="leave-pending-list">
                {pendingRequests.slice(0, 3).map((item) => (
                  <div className="leave-pending-item" key={item.id}>
                    <div className="leave-pending-icon">
                      <FiClock size={21} />
                    </div>

                    <div className="leave-pending-info">
                      <strong>{item.type}</strong>

                      <span>
                        {formatDate(item.from)} – {formatDate(item.to)}
                        {" · "}
                        {item.duration}
                      </span>
                    </div>

                    <span className="leave-status pending">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="leave-empty-state">
                <FiCalendar size={25} />
                <strong>Hurray! No pending leave requests</strong>
                <span>Request leave whenever you need it.</span>
              </div>
            )}
          </section>

          {/* LEAVE STATS */}
          <section className="leave-dashboard-section">
            <div className="leave-section-heading">
              <h3>My Leave Stats</h3>

              <select
                value={selectedPeriod}
                onChange={(event) =>
                  setSelectedPeriod(event.target.value)
                }
                className="leave-filter-select"
              >
                <option>This Month</option>
                <option>Last Month</option>
                <option>This Quarter</option>
                <option>This Year</option>
              </select>
            </div>

            <div className="leave-stats-grid">
              {/* WEEKLY PATTERN */}
              <div className="leave-card leave-chart-card">
                <div className="leave-card-heading">
                  <h4>Weekly Pattern</h4>
                  <FiInfo />
                </div>

                <div className="leave-weekly-chart">
                  {WEEKLY_PATTERN.map((item) => (
                    <div
                      className="leave-weekly-column"
                      key={item.day}
                    >
                      <div className="leave-bar-area">
                        <div
                          className="leave-weekly-bar"
                          style={{
                            height: `${Math.max(item.value * 24, 2)}px`,
                          }}
                        />
                      </div>

                      <span>{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONSUMED LEAVE TYPES */}
              <div className="leave-card leave-chart-card">
                <div className="leave-card-heading">
                  <h4>Consumed Leave Types</h4>
                  <FiInfo />
                </div>

                <div className="leave-donut-area">
                  <div className="leave-donut">
                    <div>
                      <strong>Leave</strong>
                      <span>Types</span>
                    </div>
                  </div>
                </div>

                <div className="leave-chart-legend">
                  <span>
                    <i className="casual" /> Casual
                  </span>

                  <span>
                    <i className="sick" /> Sick
                  </span>

                  <span>
                    <i className="earned" /> Earned
                  </span>
                </div>
              </div>

              {/* MONTHLY STATS */}
              <div className="leave-card leave-chart-card">
                <div className="leave-card-heading">
                  <h4>Monthly Stats</h4>
                  <FiInfo />
                </div>

                <div className="leave-monthly-chart">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map(
                    (month, index) => (
                      <div
                        key={month}
                        className="leave-month-column"
                      >
                        <div
                          className="leave-month-bar"
                          style={{
                            height: `${[18, 30, 12, 45, 24, 35][index]}px`,
                          }}
                        />

                        <span>{month}</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* LEAVE BALANCES */}
          <section className="leave-dashboard-section">
            <div className="leave-section-heading">
              <h3>Leave Balances</h3>

              <button type="button" className="leave-text-link">
                View details
              </button>
            </div>

            <div className="leave-balance-grid">
              {LEAVE_TYPES.map((leave, index) => (
                <div
                  className="leave-card leave-balance-card"
                  key={leave.name}
                >
                  <div className="leave-balance-top">
                    <div className={`leave-balance-icon balance-${index}`}>
                      <FiCalendar size={19} />
                    </div>

                    <span>{leave.name}</span>

                    <button
                      type="button"
                      title="Leave balance information"
                    >
                      <FiInfo size={16} />
                    </button>
                  </div>

                  <div className="leave-balance-number">
                    <strong>{leave.balance}</strong>
                    <span>{leave.unit} available</span>
                  </div>

                  <div className="leave-balance-track">
                    <div
                      className={`leave-balance-progress progress-${index}`}
                      style={{
                        width: `${[70, 45, 60, 30][index]}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* REQUESTS TAB */}
      {activeTab === "Requests" && (
        <section className="leave-dashboard-section">
          <div className="leave-section-heading">
            <h3>My Leave Requests</h3>
          </div>

          <LeaveRequestTable requests={requests} />
        </section>
      )}

      {/* ADD LEAVE OFFCANVAS */}
      <LeaveRequestForm
        show={showLeaveForm}
        onClose={closeLeaveForm}
        onSubmit={handleAddRequest}
        leaveTypes={LEAVE_TYPES}
      />
    </div>
  );
}

function LeaveRequestTable({ requests }) {
  if (!requests.length) {
    return (
      <div className="leave-empty-state">
        <FiCalendar size={25} />
        <strong>No leave records found</strong>
        <span>Your leave requests will appear here.</span>
      </div>
    );
  }

  return (
    <div className="leave-table-wrapper">
      <table className="leave-table">
        <thead>
          <tr>
            <th>Leave Type</th>
            <th>From Date</th>
            <th>To Date</th>
            <th>Duration</th>
            <th>Note</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {requests.map((item) => (
            <tr key={item.id}>
              <td>{item.type}</td>
              <td>{formatDate(item.from)}</td>
              <td>{formatDate(item.to)}</td>
              <td>{item.duration}</td>
              <td>{item.reason}</td>
              <td>
                <span
                  className={`leave-status ${item.status.toLowerCase()}`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LeaveDashboard;