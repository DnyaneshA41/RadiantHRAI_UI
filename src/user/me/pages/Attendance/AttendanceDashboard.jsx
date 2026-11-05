import React, { useMemo, useState } from "react";
import {
  FiCalendar,
  FiClock,
  FiLogIn,
  FiLogOut,
  FiMapPin,
  FiChevronLeft,
  FiChevronRight,
  FiGrid,
  FiList,
  FiPlus,
  FiCheckCircle,
  FiAlertCircle,
  FiHome,
  FiFileText,
  FiCoffee,
  FiUsers,
  FiUser,
  FiBriefcase,
  FiCalendar as FiCalendarOff,
  FiSun,
} from "react-icons/fi";

import WFHRequest from "../../components/Forms/Attendance/WFHRequest";
import PunchMissingRequest from "../../components/Forms/Attendance/PunchMissingRequest";

import "./AttendanceDashboard.css";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const FULL_WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const makeDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

/* GENERATE CURRENT WEEK DYNAMICALLY */

const getCurrentWeekTimings = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayKey = makeDateKey(today);

  const monday = new Date(today);
  const dayOffset = (today.getDay() + 6) % 7;

  monday.setDate(today.getDate() - dayOffset);

  const timings = [
    { working: "08h 45m", break: "01h 00m" },
    { working: "09h 10m", break: "01h 00m" },
    { working: "08h 30m", break: "00h 45m" },
    { working: "09h 00m", break: "01h 00m" },
    { working: "08h 50m", break: "01h 00m" },
    { working: "-", break: "-" },
    { working: "-", break: "-" },
  ];

  return WEEKDAYS.map((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);

    const dateKey = makeDateKey(date);

    let status;

    if (dateKey === todayKey) {
      status = "Today";
    } else if (index >= 5) {
      status = "Week Off";
    } else if (date < today) {
      status = "Present";
    } else {
      status = "Normal";
    }

    return {
      id: day,
      day: FULL_WEEKDAYS[index],
      date: String(date.getDate()),
      dateKey,
      working: date > today ? "-" : timings[index].working,
      break: date > today ? "-" : timings[index].break,
      status,
    };
  });
};

const sampleRecords = [
  {
    date: "2026-10-01",
    checkIn: "09:05",
    checkOut: "18:20",
    status: "Present",
    hours: "09:15",
    break: "01:00",
  },
  {
    date: "2026-10-02",
    checkIn: "09:25",
    checkOut: "18:30",
    status: "Late",
    hours: "09:05",
    break: "01:00",
  },
  {
    date: "2026-10-05",
    checkIn: "08:55",
    checkOut: "18:15",
    status: "Present",
    hours: "09:20",
    break: "01:00",
  },
  {
    date: "2026-10-06",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "Present",
    hours: "09:00",
    break: "01:00",
  },
  {
    date: "2026-10-07",
    checkIn: "09:15",
    checkOut: "13:30",
    status: "Half Day",
    hours: "04:15",
    break: "00:15",
  },
  {
    date: "2026-10-08",
    checkIn: "-",
    checkOut: "-",
    status: "Absent",
    hours: "00:00",
    break: "00:00",
  },
  {
    date: "2026-10-09",
    checkIn: "09:10",
    checkOut: "18:25",
    status: "Present",
    hours: "09:15",
    break: "01:00",
  },
  {
    date: "2026-10-12",
    checkIn: "08:58",
    checkOut: "18:05",
    status: "Present",
    hours: "09:07",
    break: "01:00",
  },
  {
    date: "2026-10-13",
    checkIn: "09:18",
    checkOut: "18:10",
    status: "Late",
    hours: "08:52",
    break: "01:00",
  },
  {
    date: "2026-10-14",
    checkIn: "09:02",
    checkOut: "18:12",
    status: "Present",
    hours: "09:10",
    break: "01:00",
  },
  {
    date: "2026-10-15",
    checkIn: "09:00",
    checkOut: "18:00",
    status: "Present",
    hours: "09:00",
    break: "01:00",
  },
  {
    date: "2026-10-16",
    checkIn: "09:12",
    checkOut: "18:15",
    status: "Present",
    hours: "09:03",
    break: "01:00",
  },
];

const statsData = {
  "Last Week": {
    mine: {
      present: "05",
      absent: "00",
      average: "08h 48m",
      onTime: "80%",
      late: "01",
    },
    team: {
      present: "42",
      absent: "03",
      average: "08h 35m",
      onTime: "86%",
      late: "06",
    },
  },
  "This Week": {
    mine: {
      present: "03",
      absent: "00",
      average: "08h 48m",
      onTime: "100%",
      late: "00",
    },
    team: {
      present: "38",
      absent: "02",
      average: "08h 42m",
      onTime: "91%",
      late: "04",
    },
  },
  "This Month": {
    mine: {
      present: "12",
      absent: "01",
      average: "08h 58m",
      onTime: "83%",
      late: "02",
    },
    team: {
      present: "176",
      absent: "08",
      average: "08h 40m",
      onTime: "88%",
      late: "14",
    },
  },
};

const getStatusClass = (status) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

  const statusMap = {
    present: "present",
    late: "late",
    absent: "absent",
    halfday: "half-day",
    leave: "leave",
    onleave: "leave",
    weekoff: "week-off",
    weeklyoff: "week-off",
    today: "today",
    holiday: "holiday",
    pending: "pending",
    normal: "normal",
  };

  return statusMap[normalized] || "";
};

/* WEEKLY ATTENDANCE STATUS HELPERS */

const getWeekStatus = (day) => {
  return getStatusClass(day.status) || "unmarked";
};

const getWeekStatusLabel = (status) => {
  const labels = {
    present: "Present",
    absent: "Absent",
    late: "Late",
    "half-day": "Half Day",
    leave: "Leave",
    "week-off": "Week Off",
    today: "Today",
    holiday: "Holiday",
    unmarked: "No Record",
    normal: "",
  };

  return labels[status] ?? "No Record";
};

const weekMessages = {
  "week-off": {
    title: "Enjoy your day off!",
    description:
      "This is your scheduled weekly off. No working hours are expected.",
    icon: <FiCalendarOff />,
  },
  absent: {
    title: "No attendance recorded",
    description: "There are no working hours recorded for this day.",
    icon: <FiAlertCircle />,
  },
  leave: {
    title: "Leave day",
    description: "You are marked as on leave for this day.",
    icon: <FiCalendar />,
  },
  holiday: {
    title: "Public holiday",
    description: "No regular shift is scheduled for this day.",
    icon: <FiSun />,
  },
  unmarked: {
    title: "No attendance record",
    description: "Attendance details are not available for this day.",
    icon: <FiCalendar />,
  },
};

function Attendance() {
  const [statsPeriod, setStatsPeriod] = useState("Last Week");
  const [statsType, setStatsType] = useState("mine");

  const [currentDate, setCurrentDate] = useState(() => new Date());

  const [selectedDate, setSelectedDate] = useState(() =>
    makeDateKey(new Date()),
  );

  const [calendarMode, setCalendarMode] = useState("calendar");
  const [activeTab, setActiveTab] = useState("log");

  const [selectedWeekday, setSelectedWeekday] = useState(() => {
    return WEEKDAYS[(new Date().getDay() + 6) % 7];
  });

  const [records, setRecords] = useState(sampleRecords);
  const [requests, setRequests] = useState([]);

  const [isClockedIn, setIsClockedIn] = useState(true);
  const [showWfhForm, setShowWfhForm] = useState(false);

  const [showPunchMissing, setShowPunchMissing] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");
  const [show24Hour, setShow24Hour] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const selectedStats = statsData[statsPeriod][statsType];

  const weekTimings = useMemo(() => getCurrentWeekTimings(), []);

  const monthDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const totalDays = new Date(year, month + 1, 0).getDate();
    const offset = (firstDay.getDay() + 6) % 7;

    return [
      ...Array(offset).fill(null),
      ...Array.from({ length: totalDays }, (_, index) => {
        const date = new Date(year, month, index + 1);
        return { day: index + 1, key: makeDateKey(date) };
      }),
    ];
  }, [year, month]);

  const selectedRecord = records.find((item) => item.date === selectedDate);

  const filteredRecords = records.filter((record) =>
    filterStatus === "All" ? true : record.status === filterStatus,
  );

  const changeMonth = (direction) => {
    setCurrentDate(
      (previous) =>
        new Date(previous.getFullYear(), previous.getMonth() + direction, 1),
    );
  };

  const getRecord = (dateKey) =>
    records.find((record) => record.date === dateKey);

  const formatTime = (time) => {
    if (!time || time === "-") return "-";

    const [hours, minutes] = time.split(":").map(Number);

    if (show24Hour) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    }

    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;

    return `${String(displayHour).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
  };

  /* WORK FROM HOME REQUEST HANDLERS */

  const handleAddWfhRequest = (request) => {
    setRequests((previous) => [request, ...previous]);
    setShowWfhForm(false);
    setActiveTab("requests");
  };

  const handleClockOut = () => setIsClockedIn(false);

  const handleYearChange = (event) => {
    setCurrentDate(new Date(Number(event.target.value), month, 1));
  };

  const handleMonthChange = (event) => {
    setCurrentDate(new Date(year, Number(event.target.value), 1));
  };

  const statsCards = [
    {
      label: "Present Days",
      value: selectedStats.present,
      icon: <FiCheckCircle />,
      color: "green",
    },
    {
      label: "Absent Days",
      value: selectedStats.absent,
      icon: <FiAlertCircle />,
      color: "red",
    },
    {
      label: "Average Hours / Day",
      value: selectedStats.average,
      icon: <FiClock />,
      color: "blue",
    },
    {
      label: "On-time Arrival",
      value: selectedStats.onTime,
      icon: <FiLogIn />,
      color: "orange",
    },
  ];

  return (
    <div className="attendance-page">
      {/* 1. ATTENDANCE STATS */}
      <section className="attendance-section">
        <div className="attendance-section-heading">
          <div>
            <h3>Attendance Stats</h3>
            <p>Attendance overview and performance summary.</p>
          </div>

          <select
            className="attendance-select attendance-period-select"
            value={statsPeriod}
            onChange={(event) => setStatsPeriod(event.target.value)}
          >
            <option>Last Week</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>

        <div className="d-flex justify-content-between attendance-stats-top-row">
          <div className="attendance-stats-switch">
            <button
              className={statsType === "mine" ? "active" : ""}
              onClick={() => setStatsType("mine")}
            >
              <FiUser /> My Stats
            </button>

            <button
              className={statsType === "team" ? "active" : ""}
              onClick={() => setStatsType("team")}
            >
              <FiUsers /> My Team Stats
            </button>
          </div>

          <div className="attendance-stats">
            <span>
              <FiClock /> Late arrivals
            </span>
            <strong>{selectedStats.late}</strong>
          </div>
        </div>

        <div className="attendance-stats-grid">
          {statsCards.map((item) => (
            <div className="attendance-stat-card" key={item.label}>
              <div className={`attendance-stat-icon ${item.color}`}>
                {item.icon}
              </div>

              <div className="attendance-stat-content">
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{statsPeriod}</small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. TIMINGS + ACTIONS */}
      <div className="attendance-middle-grid">
        {/* TIMINGS */}
        <section className="attendance-section attendance-timings-section">
          <div className="attendance-section-heading">
            <div>
              <h3>Timings</h3>
              <p>Your weekly attendance and work duration.</p>
            </div>

            <span className="attendance-week-label">
              <FiCalendar /> This Week
            </span>
          </div>

          {/* WEEK STRIP */}
          <div className="attendance-week-strip">
            {weekTimings.map((day) => {
              const status = getWeekStatus(day);

              return (
                <button
                  key={day.id}
                  type="button"
                  aria-pressed={selectedWeekday === day.id}
                  aria-label={`${day.day}, ${day.date}: ${getWeekStatusLabel(status) || "No status"}`}
                  title={`${day.day} - ${getWeekStatusLabel(status) || "No status"}`}
                  className={`attendance-week-day status-${status} ${
                    selectedWeekday === day.id ? "active" : ""
                  }`}
                  onClick={() => setSelectedWeekday(day.id)}
                >
                  <span className="attendance-week-day-name">{day.id}</span>
                  <strong>{day.date}</strong>

                  <span className="attendance-week-status">
                    {status !== "normal" && (
                      <>
                        <i />
                        <span>{getWeekStatusLabel(status)}</span>
                      </>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SELECTED DAY DETAILS */}
          {weekTimings
            .filter((day) => day.id === selectedWeekday)
            .map((day) => {
              const status = getWeekStatus(day);
              const isNonWorkingDay = Object.prototype.hasOwnProperty.call(
                weekMessages,
                status,
              );

              return (
                <div className="attendance-timing-details" key={day.id}>
                  <div className="attendance-timing-title">
                    <strong>{day.day}</strong>
                    <span className={`attendance-detail-status ${status}`}>
                      {getWeekStatusLabel(status)}
                    </span>
                  </div>

                  {isNonWorkingDay ? (
                    <div className={`attendance-day-message ${status}`}>
                      <span className="attendance-day-message-icon">
                        {weekMessages[status].icon}
                      </span>

                      <div>
                        <strong>{weekMessages[status].title}</strong>
                        <p>{weekMessages[status].description}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="attendance-timing-metrics">
                      <div>
                        <span>
                          <FiClock /> Working Hours
                        </span>
                        <strong>{day.working || "—"}</strong>
                      </div>

                      <div>
                        <span>
                          <FiCoffee /> Break Time
                        </span>
                        <strong>{day.break || "—"}</strong>
                      </div>

                      <div>
                        <span>
                          <FiBriefcase /> Shift Duration
                        </span>
                        <strong>{day.shiftDuration || "09h 00m"}</strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

          {/* SHIFT INFORMATION */}
          <div className="attendance-shift-info">
            <div>
              <span>Shift Timing</span>
              <strong>
                {formatTime("09:00")} - {formatTime("18:00")}
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                <FiMapPin /> Office
              </strong>
            </div>
          </div>
        </section>

        {/* ACTIONS */}
        <section className="attendance-section attendance-actions-section">
          <div className="attendance-section-heading">
            <div>
              <h3>Actions</h3>
              <p>Quick access to attendance actions.</p>
            </div>
          </div>

          <div className="attendance-clock-card">
            <div className="attendance-clock-status">
              <span
                className={isClockedIn ? "status-online" : "status-offline"}
              />
              {isClockedIn ? "Currently Clocked In" : "Clocked Out"}
            </div>

            <div className="attendance-clock-time">{formatTime("09:00")}</div>
            <p>Today's attendance</p>

            <button
              className="attendance-clock-out-btn"
              onClick={handleClockOut}
              disabled={!isClockedIn}
            >
              <FiLogOut /> Check Out
            </button>
          </div>

          <div className="attendance-action-list">
            {/* WORK FROM HOME */}
            <button type="button" onClick={() => setShowWfhForm(true)}>
              <span className="attendance-action-icon blue">
                <FiHome />
              </span>

              <span>
                <strong>Work From Home</strong>
                <small>Submit a WFH request</small>
              </span>

              <FiChevronRight />
            </button>

            {/* PUNCH MISSING - FORM WILL BE CREATED NEXT */}
            <button type="button" onClick={() => setShowPunchMissing(true)}>
              <span className="attendance-action-icon orange">
                <FiClock />
              </span>

              <span>
                <strong>Punch Missing</strong>
                <small>Request missing punch</small>
              </span>

              <FiChevronRight />
            </button>

            {/* ATTENDANCE POLICY - FORM/DETAIL VIEW WILL BE ADDED LATER */}
            <button type="button" disabled>
              <span className="attendance-action-icon purple">
                <FiFileText />
              </span>

              <span>
                <strong>Attendance Policy</strong>
                <small>View attendance rules</small>
              </span>

              <FiChevronRight />
            </button>
          </div>
        </section>
      </div>

      {/* 3. LOGS & REQUESTS */}
      <section className="attendance-section attendance-records-section">
        <div className="attendance-section-heading attendance-records-heading">
          <div>
            <h3>Logs & Requests</h3>
            <p>Manage your attendance records and requests.</p>
          </div>
        </div>

        <div className="attendance-tabs">
          <button
            className={activeTab === "log" ? "active" : ""}
            onClick={() => setActiveTab("log")}
          >
            Attendance Log
          </button>

          <button
            className={activeTab === "calendar" ? "active" : ""}
            onClick={() => setActiveTab("calendar")}
          >
            Calendar
          </button>

          <button
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => setActiveTab("requests")}
          >
            Attendance Requests
            {requests.length > 0 && (
              <span className="attendance-request-count">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        {/* ATTENDANCE LOG */}
        {activeTab === "log" && (
          <>
            <div className="attendance-log-toolbar">
              <span>Attendance Records</span>

              <select
                className="attendance-select"
                value={filterStatus}
                onChange={(event) => setFilterStatus(event.target.value)}
              >
                <option>All</option>
                <option>Present</option>
                <option>Late</option>
                <option>Absent</option>
                <option>Half Day</option>
                <option>Leave</option>
              </select>
            </div>

            <div className="attendance-table-wrapper">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Break Time</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRecords.length ? (
                    filteredRecords.map((record) => (
                      <tr key={record.date}>
                        <td>{formatDate(record.date)}</td>
                        <td>{formatTime(record.checkIn)}</td>
                        <td>{formatTime(record.checkOut)}</td>
                        <td>{record.hours}</td>
                        <td>{record.break}</td>
                        <td>
                          <span
                            className={`attendance-status-badge ${getStatusClass(record.status)}`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="attendance-no-records">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* CALENDAR */}
        {activeTab === "calendar" && (
          <div className="attendance-calendar-layout">
            <div className="attendance-calendar-main">
              <div className="attendance-calendar-toolbar">
                <div className="attendance-calendar-navigation">
                  <button
                    aria-label="Previous month"
                    onClick={() => changeMonth(-1)}
                  >
                    <FiChevronLeft />
                  </button>

                  <button
                    aria-label="Next month"
                    onClick={() => changeMonth(1)}
                  >
                    <FiChevronRight />
                  </button>
                </div>

                <div className="attendance-calendar-selectors">
                  <select
                    className="attendance-select"
                    value={month}
                    onChange={handleMonthChange}
                  >
                    {MONTHS.map((name, index) => (
                      <option value={index} key={name}>
                        {name}
                      </option>
                    ))}
                  </select>

                  <select
                    className="attendance-select"
                    value={year}
                    onChange={handleYearChange}
                  >
                    {Array.from({ length: 15 }, (_, index) => 2020 + index).map(
                      (value) => (
                        <option value={value} key={value}>
                          {value}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="attendance-view-toggle">
                  <button
                    className={calendarMode === "calendar" ? "active" : ""}
                    onClick={() => setCalendarMode("calendar")}
                    aria-label="Calendar view"
                  >
                    <FiGrid />
                  </button>

                  <button
                    className={calendarMode === "list" ? "active" : ""}
                    onClick={() => setCalendarMode("list")}
                    aria-label="List view"
                  >
                    <FiList />
                  </button>
                </div>
              </div>

              {calendarMode === "calendar" ? (
                <div className="attendance-month-grid">
                  {WEEKDAYS.map((day) => (
                    <div className="attendance-month-weekday" key={day}>
                      {day}
                    </div>
                  ))}

                  {monthDays.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="attendance-month-empty"
                        />
                      );
                    }

                    const record = getRecord(date.key);

                    return (
                      <button
                        key={date.key}
                        className={`attendance-month-day ${
                          record ? getStatusClass(record.status) : ""
                        } ${selectedDate === date.key ? "selected" : ""}`}
                        onClick={() => setSelectedDate(date.key)}
                      >
                        <span>{date.day}</span>
                        {record && <i />}
                        {record && <small>{record.status}</small>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="attendance-calendar-list">
                  {records
                    .filter((record) =>
                      record.date.startsWith(
                        `${year}-${String(month + 1).padStart(2, "0")}`,
                      ),
                    )
                    .map((record) => (
                      <button
                        key={record.date}
                        className={
                          selectedDate === record.date ? "selected" : ""
                        }
                        onClick={() => setSelectedDate(record.date)}
                      >
                        <span>{formatDate(record.date)}</span>
                        <span>{record.hours}</span>
                        <span
                          className={`attendance-status-badge ${getStatusClass(record.status)}`}
                        >
                          {record.status}
                        </span>
                      </button>
                    ))}

                  {!records.some((record) =>
                    record.date.startsWith(
                      `${year}-${String(month + 1).padStart(2, "0")}`,
                    ),
                  ) && (
                    <div className="attendance-no-records">
                      No records for this month.
                    </div>
                  )}
                </div>
              )}

              <div className="attendance-calendar-legend">
                {["Present", "Late", "Absent", "Half Day", "Leave"].map(
                  (status) => (
                    <span key={status}>
                      <i className={getStatusClass(status)} />
                      {status}
                    </span>
                  ),
                )}
              </div>
            </div>

            <aside className="attendance-selected-day">
              <h4>Daily Attendance Details</h4>
              <p>{formatDate(selectedDate)}</p>

              {selectedRecord ? (
                <>
                  <span
                    className={`attendance-status-badge ${getStatusClass(selectedRecord.status)}`}
                  >
                    {selectedRecord.status}
                  </span>

                  <div className="attendance-detail-line">
                    <span>Check In</span>
                    <strong>{formatTime(selectedRecord.checkIn)}</strong>
                  </div>

                  <div className="attendance-detail-line">
                    <span>Check Out</span>
                    <strong>{formatTime(selectedRecord.checkOut)}</strong>
                  </div>

                  <div className="attendance-detail-line">
                    <span>Working Hours</span>
                    <strong>{selectedRecord.hours}</strong>
                  </div>

                  <div className="attendance-detail-line">
                    <span>Break Time</span>
                    <strong>{selectedRecord.break}</strong>
                  </div>
                </>
              ) : (
                <div className="attendance-day-empty">
                  <FiCalendar />
                  <span>No attendance record for this date.</span>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* ATTENDANCE REQUESTS */}
        {activeTab === "requests" && (
          <div className="attendance-requests-list">
            {requests.length === 0 ? (
              <div className="attendance-no-records">
                No attendance requests submitted yet.
              </div>
            ) : (
              requests.map((request) => (
                <div className="attendance-request-item" key={request.id}>
                  <div>
                    <strong>{request.type}</strong>

                    <span>
                      {request.type === "Work From Home"
                        ? `${formatDate(request.from)} - ${formatDate(request.to)}`
                        : formatDate(request.date)}
                    </span>

                    <p>{request.reason || "—"}</p>

                    {request.type === "Work From Home" && (
                      <small>
                        Duration: {request.duration}
                        {request.workMode !== "Hourly" &&
                          ` (${request.workMode})`}
                      </small>
                    )}
                  </div>

                  <span className="attendance-status-badge pending">
                    {request.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* WORK FROM HOME REQUEST OFFCANVAS */}
      <WFHRequest
        show={showWfhForm}
        onClose={() => setShowWfhForm(false)}
        onSubmit={handleAddWfhRequest}
        employeeOptions={[]}
      />

      <PunchMissingRequest
        show={showPunchMissing}
        onClose={() => setShowPunchMissing(false)}
        onSubmit={(request) => {
          console.log("Punch Missing Request:", request);
        }}
      />
    </div>
  );
}

export default Attendance;
