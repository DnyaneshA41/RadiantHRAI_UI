import { useMemo, useState } from "react";
import { FiDownload, FiChevronDown } from "react-icons/fi";

import FormInput from "../../../../../common/components/Form/FormInput";
import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormButton from "../../../../../common/components/Form/FormButton";
import DynamicCalendar from "../../../../../common/components/calendar/DynamicCalendar";
import FormToggleBtn from "../../../../../common/components/FormToggleBtn/FormToggleBtn";
import useSectionAnimation from "../../../../../common/hooks/useSectionAnimation";

import EarningsTable from "./TableComponent/EarningsTable";
import DeductionTables from "./TableComponent/DeductionTables";
import {
  validateIncrementForm,
  validateIncrementField,
} from "../../../validations/incrementHistorySchema";

import "./IncrementHistory.css";

/* =========================================================
   INITIAL REVISION DATA
========================================================= */

const initialRevisions = [
  {
    id: 1,
    title: "Annual appraisal · 2026",
    badge: "Current",
    kind: "current",
    effective: "01 Nov 2026",
    oldCTC: 1600000,
    newCTC: 1800000,
    reason: "Performance rating 4.5/5 · Band: SDE-2 → SDE-2 (merit)",
    approved: "Approved by: Priya Sharma (Engg. Head) · PID-4421 · 28 Oct 2026",
  },
  {
    id: 2,
    title: "Promotion · SDE-1 to SDE-2",
    badge: "Promotion",
    kind: "promotion",
    effective: "01 Apr 2025",
    oldCTC: 1200000,
    newCTC: 1600000,
    reason: "",
    approved:
      "Approved by: Rohan Mehta (VP Engg.) · Reason: Promotion + merit · 25 Mar 2025",
  },
  {
    id: 3,
    title: "Annual appraisal · 2024",
    badge: "Annual",
    kind: "annual",
    effective: "01 Apr 2024",
    oldCTC: 1080000,
    newCTC: 1200000,
    reason: "",
    approved: "Approved by: Rohan Mehta · Rating 4.0/5 · 20 Mar 2024",
  },
  {
    id: 4,
    title: "Confirmation after probation",
    badge: "Correction",
    kind: "correction",
    effective: "01 Oct 2023",
    oldCTC: 960000,
    newCTC: 1080000,
    reason: "",
    approved:
      "Approved by: HR Policy · Reason: Probation complete · 28 Sep 2023",
  },
];

/* =========================================================
   INCREMENT FORM OPTIONS
========================================================= */

const incrementTypeOptions = [
  { label: "Annual appraisal", value: "Annual appraisal" },
  { label: "Promotion", value: "Promotion" },
  { label: "Correction", value: "Correction" },
  {
    label: "Confirmation after probation",
    value: "Confirmation after probation",
  },
];

const approverOptions = [
  {
    label: "Priya Sharma (Engg. Head)",
    value: "Priya Sharma (Engg. Head)",
  },
  {
    label: "Rohan Mehta (VP Engg.)",
    value: "Rohan Mehta (VP Engg.)",
  },
  { label: "HR Manager", value: "HR Manager" },
];

/* =========================================================
   INITIAL CTC TABLE DATA
========================================================= */

const initialEarnings = [
  {
    id: 1,
    component: "Basic",
    method: "50% of CTC",
    monthly: "75000",
    annual: "900000",
  },
  {
    id: 2,
    component: "HRA",
    method: "40% of Basic",
    monthly: "30000",
    annual: "360000",
  },
];

const initialEmployeeContributions = [
  { id: 1, component: "PF", amount: "1800" },
  { id: 2, component: "PT", amount: "200" },
  { id: 3, component: "TDS", amount: "8250" },
];

const initialEmployerContributions = [
  { id: 1, component: "PF", amount: "1800" },
  { id: 2, component: "ESIC", amount: "0" },
  { id: 3, component: "LWF", amount: "0" },
];

/* =========================================================
   HELPERS
========================================================= */

const money = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const formatAmount = (amount) =>
  Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/*  EXPANDABLE REVISION TABLES  */

function RevisionTables({
  isOpen,
  earnings,
  employeeContributions,
  employerContributions,
  gross,
  annualGross,
  totalEmployeeDeduction,
  totalEmployerDeduction,
  netPay,
  handleEarningChange,
  handleContributionChange,
  handleAutoSplit,
  formatAmount,
}) {
  const revisionBodyRef = useSectionAnimation(isOpen);

  return (
    <div
      ref={revisionBodyRef}
      className={`hrms-form-section-collapse ${isOpen ? "is-open" : ""}`}
    >
      <div className="hrms-form-section-collapse-inner">
        <div className="ih-revision-tables">
          {/* EARNINGS TABLE */}
          <EarningsTable
            earnings={earnings}
            gross={gross}
            annualGross={annualGross}
            formatAmount={formatAmount}
            handleEarningChange={handleEarningChange}
            handleAutoSplit={handleAutoSplit}
          />

          {/* EMPLOYEE AND EMPLOYER CONTRIBUTION TABLES */}
          <DeductionTables
            employeeContributions={employeeContributions}
            employerContributions={employerContributions}
            handleContributionChange={handleContributionChange}
            totalEmployeeDeduction={totalEmployeeDeduction}
            totalEmployerDeduction={totalEmployerDeduction}
            netPay={netPay}
          />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   INCREMENT HISTORY
========================================================= */

function IncrementHistory({ employee = {}, onBack }) {
  const [revisions, setRevisions] = useState(initialRevisions);
  const [filter, setFilter] = useState("All");
  const [hikeMethod, setHikeMethod] = useState("% hike");

  const [formData, setFormData] = useState({
    incrementType: "Annual appraisal",
    hikeMethod: "% hike",
    hikePercentage: "15.00",
    flatAmount: "",
    targetCTC: "",
    effectiveFrom: "2027-04-01",
    arrearsFrom: "",
    reason:
      "Performance rating 4.6/5, exceeded OKRs on checkout redesign, mentored 2 juniors.",
    approver: "Priya Sharma (Engg. Head)",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  /* =========================================================
     EXPANDED REVISION CARDS
  ========================================================= */

  const [expandedRevisions, setExpandedRevisions] = useState({});

  const toggleRevision = (revisionId) => {
    setExpandedRevisions((previous) => ({
      [revisionId]: !previous[revisionId],
    }));
  };

  /* =========================================================
     CTC TABLE STATE
  ========================================================= */

  const [earnings, setEarnings] = useState(initialEarnings);

  const [employeeContributions, setEmployeeContributions] = useState(
    initialEmployeeContributions,
  );

  const [employerContributions, setEmployerContributions] = useState(
    initialEmployerContributions,
  );

  /* =========================================================
     EMPLOYEE INFORMATION
  ========================================================= */

  const employeeName = employee.name || "Mr. Krishna";
  const employeeId = employee.empId || "TS012";
  const designation = employee.designation || "Software Developer – UI/UX";

  /* =========================================================
     CTC CALCULATIONS
  ========================================================= */

  const currentCTC = revisions[0]?.newCTC || 0;
  const originalCTC = revisions[revisions.length - 1]?.oldCTC || 0;
  const lifetimeGrowth = currentCTC - originalCTC;

  const gross = useMemo(
    () =>
      earnings.reduce((total, item) => total + (Number(item.monthly) || 0), 0),
    [earnings],
  );

  const annualGross = useMemo(
    () =>
      earnings.reduce((total, item) => total + (Number(item.annual) || 0), 0),
    [earnings],
  );

  const totalEmployeeDeduction = useMemo(
    () =>
      employeeContributions.reduce(
        (total, item) => total + (Number(item.amount) || 0),
        0,
      ),
    [employeeContributions],
  );

  const totalEmployerDeduction = useMemo(
    () =>
      employerContributions.reduce(
        (total, item) => total + (Number(item.amount) || 0),
        0,
      ),
    [employerContributions],
  );

  const netPay = gross - totalEmployeeDeduction;

  const averageHike = useMemo(() => {
    if (!revisions.length) return 0;

    const percentages = revisions
      .filter((item) => item.oldCTC > 0)
      .map((item) => ((item.newCTC - item.oldCTC) / item.oldCTC) * 100);

    if (!percentages.length) return 0;

    return (
      percentages.reduce((total, value) => total + value, 0) /
      percentages.length
    );
  }, [revisions]);

  /* =========================================================
     NEW CTC PREVIEW
  ========================================================= */

  const newCTC = useMemo(() => {
    if (hikeMethod === "Flat amount") {
      return currentCTC + (Number(formData.flatAmount) || 0);
    }

    if (hikeMethod === "Target CTC") {
      return Number(formData.targetCTC) || currentCTC;
    }

    return Math.round(
      currentCTC * (1 + (Number(formData.hikePercentage) || 0) / 100),
    );
  }, [
    currentCTC,
    formData.flatAmount,
    formData.hikePercentage,
    formData.targetCTC,
    hikeMethod,
  ]);

  const hikeAmount = newCTC - currentCTC;
  const hikePercent = currentCTC ? (hikeAmount / currentCTC) * 100 : 0;

  /* =========================================================
     REVISION FILTER
  ========================================================= */

  const filteredRevisions = revisions.filter((item) => {
    if (filter === "All") return true;

    if (filter === "Annual") {
      return item.kind === "annual" || item.title.includes("Annual appraisal");
    }

    if (filter === "Promotion") return item.kind === "promotion";
    if (filter === "Correction") return item.kind === "correction";

    return true;
  });

  /* =========================================================
     FORM HANDLERS
  ========================================================= */
  const handleChange = (event) => {
  const { name, value } = event.target;

  const updatedFormData = {
    ...formData,
    [name]: value,
  };

  setFormData(updatedFormData);

  setErrors((previousErrors) => {
    const nextErrors = { ...previousErrors };

    const fieldError = validateIncrementField(
      name,
      updatedFormData
    );

    if (fieldError) {
      nextErrors[name] = fieldError;
    } else {
      delete nextErrors[name];
    }

    // After the first submission attempt, validate all fields live.
    if (submitted) {
      return validateIncrementForm(updatedFormData);
    }

    // Revalidate related date fields when either date changes.
    if (name === "effectiveFrom" || name === "arrearsFrom") {
      const allErrors = validateIncrementForm(updatedFormData);

      // Update the Arrears from error.
      if (allErrors.arrearsFrom) {
        nextErrors.arrearsFrom = allErrors.arrearsFrom;
      } else {
        delete nextErrors.arrearsFrom;
      }

      // Update the Effective from error when that field changes.
      if (name === "effectiveFrom") {
        if (allErrors.effectiveFrom) {
          nextErrors.effectiveFrom = allErrors.effectiveFrom;
        } else {
          delete nextErrors.effectiveFrom;
        }
      }

      return nextErrors;
    }

    return nextErrors;
  });
};

  /* =========================================================
     EARNINGS TABLE HANDLERS
  ========================================================= */

  const handleEarningChange = (id, field, value) => {
    setEarnings((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAutoSplit = (id, value) => {
    setEarnings((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;

        const monthly = Number(value) || 0;

        return {
          ...item,
          monthly: String(monthly),
          annual: String(monthly * 12),
        };
      }),
    );
  };

  /* =========================================================
     CONTRIBUTION TABLE HANDLER
  ========================================================= */

  const handleContributionChange = (type, id, value) => {
    if (type === "employee") {
      setEmployeeContributions((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, amount: value } : item,
        ),
      );

      return;
    }

    if (type === "employer") {
      setEmployerContributions((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, amount: value } : item,
        ),
      );
    }
  };

  /* =========================================================
     EXPORT HISTORY
  ========================================================= */

  const handleExport = () => {
    const rows = [
      ["Increment", "Effective date", "Previous CTC", "Revised CTC", "Reason"],
      ...revisions.map((item) => [
        item.title,
        item.effective,
        item.oldCTC,
        item.newCTC,
        item.reason || "",
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "increment-history.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  /* =========================================================
     SUBMIT NEW INCREMENT
  ========================================================= */

  const handleSubmit = () => {
    const dataToValidate = {
      ...formData,
      hikeMethod,
    };

    const validationErrors = validateIncrementForm(dataToValidate);

    setSubmitted(true);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Ensure the calculated CTC is valid before submitting.
    if (!Number.isFinite(newCTC) || newCTC <= currentCTC) {
      setErrors({
        [hikeMethod === "% hike"
          ? "hikePercentage"
          : hikeMethod === "Flat amount"
            ? "flatAmount"
            : "targetCTC"]:
          "The revised CTC must be greater than the current CTC",
      });

      return;
    }

    const newRevision = {
      id: Date.now(),
      title: `${formData.incrementType} · ${new Date().getFullYear()}`,
      badge:
        formData.incrementType === "Annual appraisal"
          ? "Annual"
          : formData.incrementType,
      kind:
        formData.incrementType === "Promotion"
          ? "promotion"
          : formData.incrementType === "Correction"
            ? "correction"
            : "annual",
      effective: formData.effectiveFrom.split("-").reverse().join("/"),
      oldCTC: currentCTC,
      newCTC,
      reason: formData.reason,
      approved: `Approver: ${formData.approver} · Pending approval`,
    };

    setRevisions((previous) => [newRevision, ...previous]);

    console.log("Increment submission:", {
      ...dataToValidate,
      oldCTC: currentCTC,
      newCTC,
      hikeAmount,
      hikePercent,
    });
  };

  /* =========================================================
     SAVE DRAFT
  ========================================================= */

  const handleSaveDraft = () => {
    console.log("Increment draft:", {
      ...formData,
      hikeMethod,
    });
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="hrms-form-container increment-history-page">
      <div className="ih-page-content">
        {/* EMPLOYEE HEADER */}
        <div className="ih-employee-header">
          <div className="ih-employee-avatar">
            {employeeName
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word[0])
              .join("")
              .toUpperCase()}
          </div>

          <div className="ih-employee-details">
            <div className="ih-employee-name">
              {employeeName} · {employeeId}
            </div>

            <div className="ih-employee-meta">
              {designation} · Current CTC {money(currentCTC)} · Last revised 01
              Nov 2026
            </div>
          </div>

          <div className="ih-employee-actions">
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleExport}
            >
              Export history
              <FiDownload className="ms-1" size={15} />
            </FormButton>

            <FormButton type="button" variant="primary" onClick={onBack}>
              CTC Details
            </FormButton>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="ih-summary-grid">
          <div className="ih-summary-card">
            <div className="ih-summary-label">Current CTC</div>
            <div className="ih-summary-value">{money(currentCTC)}</div>
            <div className="ih-summary-foot positive">
              ▲ 12.5% from last revision
            </div>
          </div>

          <div className="ih-summary-card">
            <div className="ih-summary-label">Lifetime growth</div>
            <div className="ih-summary-value">+ {money(lifetimeGrowth)}</div>
            <div className="ih-summary-foot">
              {originalCTC
                ? ((lifetimeGrowth / originalCTC) * 100).toFixed(1)
                : "0.0"}
              % over {revisions.length} revisions
            </div>
          </div>

          <div className="ih-summary-card">
            <div className="ih-summary-label">Avg annual hike</div>
            <div className="ih-summary-value">{averageHike.toFixed(1)}%</div>
            <div className="ih-summary-foot">Band median: 11%</div>
          </div>

          <div className="ih-summary-card review-card">
            <div className="ih-summary-label">Next review due</div>
            <div className="ih-review-date">01 Apr 2027</div>
            <div className="ih-review-foot">
              Annual appraisal cycle · 167 days
            </div>
          </div>
        </div>

        {/* TIMELINE AND INCREMENT FORM */}
        <div className="ih-main-grid">
          {/* REVISION TIMELINE */}
          <section className="ih-panel ih-timeline-panel">
            <div className="ih-panel-header">
              <h2>Revision timeline</h2>

              <div className="ih-filter-list">
                {["All", "Annual", "Promotion", "Correction"].map(
                  (item, index) => (
                    <button
                      type="button"
                      key={item}
                      className={filter === item ? "active" : ""}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                      {index < 3 && <span> · </span>}
                    </button>
                  ),
                )}

                <FiChevronDown size={12} />
              </div>
            </div>

            <div className="ih-timeline">
              {filteredRevisions.map((item) => {
                const change = item.newCTC - item.oldCTC;
                const percentage = item.oldCTC
                  ? (change / item.oldCTC) * 100
                  : 0;

                const isExpanded = Boolean(expandedRevisions[item.id]);

                return (
                  <article
                    key={item.id}
                    className={`ih-timeline-entry ${
                      item.kind === "current" ? "current" : ""
                    }`}
                  >
                    <div className="ih-timeline-marker">
                      <span />
                    </div>

                    <div className="ih-revision-card">
                      {/* REVISION HEADER */}
                      <div className="ih-revision-top">
                        <div className="ih-revision-title-group">
                          <h3>{item.title}</h3>

                          <span className={`ih-revision-badge ${item.kind}`}>
                            {item.badge}
                          </span>
                        </div>

                        <div className="ih-revision-actions">
                          <span className="ih-effective-date">
                            Effective {item.effective}
                          </span>

                          <FormToggleBtn
                            isOpen={isExpanded}
                            onClick={() => toggleRevision(item.id)}
                          />
                        </div>
                      </div>

                      {/* REVISION AMOUNTS */}
                      <div className="ih-revision-amounts">
                        <span>
                          {money(item.oldCTC)} → {money(item.newCTC)}
                        </span>

                        <strong>
                          + {money(change)} ({percentage.toFixed(1)}%)
                        </strong>
                      </div>

                      {item.reason && (
                        <p className="ih-revision-reason">{item.reason}</p>
                      )}

                      <p className="ih-revision-approved">{item.approved}</p>

                      {/* EXPANDABLE EARNINGS AND CONTRIBUTION TABLES */}
                      <RevisionTables
                        isOpen={isExpanded}
                        earnings={earnings}
                        employeeContributions={employeeContributions}
                        employerContributions={employerContributions}
                        gross={gross}
                        annualGross={annualGross}
                        totalEmployeeDeduction={totalEmployeeDeduction}
                        totalEmployerDeduction={totalEmployerDeduction}
                        netPay={netPay}
                        handleEarningChange={handleEarningChange}
                        handleContributionChange={handleContributionChange}
                        handleAutoSplit={handleAutoSplit}
                        formatAmount={formatAmount}
                      />
                    </div>
                  </article>
                );
              })}

              <div className="ih-timeline-start">
                <span className="ih-start-marker" />
                <span>01 Apr 2023 · Joined at {money(originalCTC)}</span>
              </div>
            </div>
          </section>

          {/* RECORD NEW INCREMENT */}
          <section className="ih-panel ih-new-increment-panel">
            <h2>Record a new increment</h2>

            <div className="ih-field">
              <FormSelect
                label="Increment type"
                name="incrementType"
                value={formData.incrementType}
                onChange={handleChange}
                options={incrementTypeOptions}
                required
                error={errors.incrementType}
              />
            </div>

            <div className="ih-field">
              <label className="ih-label">Hike method</label>

              <div className="ih-hike-methods">
                {["% hike", "Flat amount", "Target CTC"].map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={hikeMethod === method ? "active" : ""}
                    onClick={() => {
                      setHikeMethod(method);

                      setFormData((prev) => {
                        const updatedData = {
                          ...prev,
                          hikeMethod: method,
                        };

                        const fieldName =
                          method === "% hike"
                            ? "hikePercentage"
                            : method === "Flat amount"
                              ? "flatAmount"
                              : "targetCTC";

                        setErrors((prevErrors) => {
                          const nextErrors = { ...prevErrors };

                          // Clear errors for all hike methods first.
                          delete nextErrors.hikePercentage;
                          delete nextErrors.flatAmount;
                          delete nextErrors.targetCTC;

                          // Validate the currently selected hike method.
                          if (submitted) {
                            const fieldError = validateIncrementField(
                              fieldName,
                              updatedData,
                            );

                            if (fieldError) {
                              nextErrors[fieldName] = fieldError;
                            }
                          }

                          return nextErrors;
                        });

                        return updatedData;
                      });
                    }}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            <div className="ih-field-row">
              <div className="ih-field">
                {hikeMethod === "% hike" && (
                  <FormInput
                    label="Hike percentage"
                    name="hikePercentage"
                    type="number"
                    value={formData.hikePercentage}
                    onChange={handleChange}
                    required
                    error={errors.hikePercentage}
                    min="0"
                    step="any"
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                )}

                {hikeMethod === "Flat amount" && (
                  <FormInput
                    label="Hike amount (₹)"
                    name="flatAmount"
                    type="number"
                    value={formData.flatAmount}
                    onChange={handleChange}
                    required
                    error={errors.flatAmount}
                    min="0"
                    step="any"
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                )}

                {hikeMethod === "Target CTC" && (
                  <FormInput
                    label="Target CTC (₹)"
                    name="targetCTC"
                    type="number"
                    value={formData.targetCTC}
                    onChange={handleChange}
                    required
                    error={errors.targetCTC}
                    min="0"
                    step="any"
                    onKeyDown={(e) => {
                      if (["-", "+", "e", "E"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                )}
              </div>

              <div className="ih-field">
                <label className="ih-label">New CTC (preview)</label>
                <div className="ih-preview-value">{money(newCTC)}</div>
              </div>
            </div>

            <div className="ih-hike-caption">
              Change: {money(hikeAmount)} ({hikePercent.toFixed(2)}%)
            </div>

            <div className="ih-field-row">
              <div className="ih-field">
                <DynamicCalendar
  mode="dd-mm-yyyy"
  label="Effective from"
  name="effectiveFrom"
  value={formData.effectiveFrom}
  onChange={handleChange}
  placeholder="dd/mm/yyyy"
  required
  error={errors.effectiveFrom}
/>
              </div>

              <div className="ih-field">
                <DynamicCalendar
  mode="dd-mm-yyyy"
  label="Arrears from"
  name="arrearsFrom"
  value={formData.arrearsFrom}
  onChange={handleChange}
  placeholder="dd/mm/yyyy"
  error={errors.arrearsFrom}
/>
              </div>
            </div>

            <div className="ih-field">
              <label className="hrms-form-label" htmlFor="incrementReason">
                Reason / justification
              </label>

              <textarea
                id="incrementReason"
                className="ih-textarea"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="ih-field">
              <FormSelect
                label="Approver"
                name="approver"
                value={formData.approver}
                onChange={handleChange}
                options={approverOptions}
                required
                error={errors.approver}
              />
            </div>

            <div className="ih-form-actions">
              <FormButton
                type="button"
                variant="secondary"
                onClick={handleSaveDraft}
              >
                Save draft
              </FormButton>

              <FormButton
                type="button"
                variant="primary"
                onClick={handleSubmit}
              >
                Submit for approval
              </FormButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default IncrementHistory;
