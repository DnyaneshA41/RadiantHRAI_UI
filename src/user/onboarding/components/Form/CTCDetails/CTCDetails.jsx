import { useState } from "react";
import { FiDollarSign } from "react-icons/fi";

import FormInput from "../../../../../common/components/Form/FormInput";
import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormButton from "../../../../../common/components/Form/FormButton";
import DynamicCalendar from "../../../../../common/components/calendar/DynamicCalendar";

import "./CTCDetails.css";
import IncrementHistory from "./IncrementHistory";
import EarningsTable from "./TableComponent/EarningsTable";
import DeductionTables from "./TableComponent/DeductionTables";

import {
  validateCTCField,
  validateCTCForm,
} from "../../../validations/ctcDetailsSchema";

const optionsFrom = (values) =>
  values.map((value) => ({ value, label: value }));

const payCycleOptions = optionsFrom([
  "1st of month",
  "5th of month",
  "Last day of month",
]);

const initialFormData = {
  annualCTC: "1800000",
  monthlyCTC: "150000",
  effectiveFrom: "2026-11-01",
  payCycle: "1st of month",
};

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

function CTCDetails({ employee = {}, onBackToList }) {
  const [showIncrementHistory, setShowIncrementHistory] = useState(false);
  const [salaryType, setSalaryType] = useState("Monthly");
  const [formData, setFormData] = useState({ ...initialFormData });
  const [earnings, setEarnings] = useState(
    initialEarnings.map((item) => ({ ...item })),
  );

  const [employeeContributions, setEmployeeContributions] = useState(
    initialEmployeeContributions.map((item) => ({ ...item })),
  );

  const [employerContributions, setEmployerContributions] = useState(
    initialEmployerContributions.map((item) => ({ ...item })),
  );

  const [selectedCountry, setSelectedCountry] = useState("India");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const countries = [
    { code: "IN", label: "India" },
    { code: "GB", label: "UK" },
    { code: "US", label: "USA" },
    { code: "AE", label: "UAE" },
    { code: "SG", label: "S'pore" },
    { code: "AU", label: "Aus" },
    { code: "DE", label: "Germany" },
  ];

  const formatAmount = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  const gross = earnings.reduce(
    (total, item) => total + (Number(item.monthly) || 0),
    0,
  );

  const annualGross = earnings.reduce(
    (total, item) => total + (Number(item.annual) || 0),
    0,
  );

  const employeePF = employeeContributions.reduce((total, item) => {
    return item.component.toLowerCase() === "pf"
      ? total + (Number(item.amount) || 0)
      : total;
  }, 0);

  const employerPF = employerContributions.reduce((total, item) => {
    return item.component.toLowerCase() === "pf"
      ? total + (Number(item.amount) || 0)
      : total;
  }, 0);

  const professionalTax = employeeContributions.reduce((total, item) => {
    return item.component.toLowerCase() === "pt"
      ? total + (Number(item.amount) || 0)
      : total;
  }, 0);

  const tds = employeeContributions.reduce((total, item) => {
    return item.component.toLowerCase() === "tds"
      ? total + (Number(item.amount) || 0)
      : total;
  }, 0);

  const gratuity = 3608;

  const netTakeHome = gross - employeePF - professionalTax - tds;

  const totalEmployeeDeduction = employeeContributions.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0,
  );

  const totalEmployerDeduction = employerContributions.reduce(
    (total, item) => total + (Number(item.amount) || 0),
    0,
  );

  const netPay = gross - totalEmployeeDeduction - totalEmployerDeduction;

  /*
   * Handle form changes and validate using the Zod schema.
   * Validation rules are maintained in ctcDetailsSchema.js.
   */
  const handleChange = (event) => {
    const { name, value } = event.target;

    const updatedFormData = {
      ...formData,
      [name]: value,
    };

    // Calculate monthly CTC whenever annual CTC changes.
    if (name === "annualCTC") {
      const annualValue = Number(value);

      updatedFormData.monthlyCTC =
        value.trim() !== "" && Number.isFinite(annualValue)
          ? String(Math.round(annualValue / 12))
          : "";
    }

    setFormData(updatedFormData);

    // Validate the changed field immediately.
    setErrors((previousErrors) => {
      const updatedErrors = { ...previousErrors };

      const fieldError = validateCTCField(
        name,
        updatedFormData[name],
        updatedFormData,
      );

      if (fieldError) {
        updatedErrors[name] = fieldError;
      } else {
        delete updatedErrors[name];
      }

      // Annual CTC also changes Monthly CTC, so validate it too.
      if (name === "annualCTC") {
        const monthlyError = validateCTCField(
          "monthlyCTC",
          updatedFormData.monthlyCTC,
          updatedFormData,
        );

        if (monthlyError) {
          updatedErrors.monthlyCTC = monthlyError;
        } else {
          delete updatedErrors.monthlyCTC;
        }
      }

      // Once Save has been attempted, keep all errors updated live.
      if (submitted) {
        const allErrors = validateCTCForm(updatedFormData);

        Object.keys(updatedErrors).forEach((field) => {
          if (!allErrors[field]) {
            delete updatedErrors[field];
          }
        });

        Object.assign(updatedErrors, allErrors);
      }

      return updatedErrors;
    });
  };

  const handleEarningChange = (id, field, value) => {
    setEarnings((previous) =>
      previous.map((item) => {
        if (item.id !== id) return item;

        const updated = { ...item, [field]: value };

        if (field === "monthly") {
          updated.annual = String((Number(value) || 0) * 12);
        }

        if (field === "annual") {
          updated.monthly = String(Math.round((Number(value) || 0) / 12));
        }

        return updated;
      }),
    );
  };

  const handleContributionChange = (type, id, value) => {
    const setter =
      type === "employee" ? setEmployeeContributions : setEmployerContributions;

    setter((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, amount: value } : item,
      ),
    );
  };

  /*
   * Validate the complete form with Zod before saving.
   */
  const handleSave = (event) => {
    event.preventDefault();

    setSubmitted(true);

    const validationErrors = validateCTCForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const payload = {
      employeeId: employee?.empId ?? employee?.employeeId ?? employee?.id ?? "",
      salaryType,
      selectedCountry,
      ...formData,
      annualCTC: Number(formData.annualCTC),
      monthlyCTC: Number(formData.monthlyCTC),
      earnings,
      employeeContributions,
      employerContributions,
      gross,
      annualGross,
      employeePF,
      employerPF,
      gratuity,
      professionalTax,
      tds,
      totalEmployeeDeduction,
      totalEmployerDeduction,
      netTakeHome,
      netPay,
    };

    console.log("CTC Details:", payload);
    alert("CTC details are ready to save.");
  };

  const handleUseTemplate = () => {
    alert("Template selection can be connected here.");
  };

  const handlePreviewPayslip = () => {
    alert("Payslip preview can be connected here.");
  };

  const handleAutoSplit = () => {
    alert("Template-based salary splitting can be connected here.");
  };

  const handleList = () => {
    setErrors({});
    setSubmitted(false);

    if (onBackToList) {
      onBackToList();
    }
  };

  return (
    <>
      {showIncrementHistory ? (
        <IncrementHistory
          employee={employee}
          onBack={() => setShowIncrementHistory(false)}
        />
      ) : (
        <div className="hrms-form-container ctc-details-page">
          <form className="ctc-details-form" onSubmit={handleSave} noValidate>
            <section className="hrms-form-section-card">
              {/* EMPLOYEE HEADER */}
              <div className="hrms-form-section-header">
                <div className="hrms-section-heading-group">
                  <div className="hrms-form-section-icon">
                    <FiDollarSign size={19} />
                  </div>

                  <div className="hrms-form-section-heading">
                    <h3 className="hrms-form-section-title">CTC Details</h3>

                    <div className="employee-information">
                      <span>
                        Mr.Krishna - TS012 (Software developer - UI/UX)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ctc-header-actions">
                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={handleUseTemplate}
                  >
                    Use template
                  </FormButton>

                  <FormButton
                    type="button"
                    variant="secondary"
                    onClick={handlePreviewPayslip}
                  >
                    Preview payslip
                  </FormButton>

                  <FormButton
                    type="button"
                    variant="primary"
                    onClick={() => setShowIncrementHistory(true)}
                  >
                    Increment
                  </FormButton>
                </div>
              </div>

              {/* MAIN LAYOUT */}
              <div className="hrms-form-section-body">
                <div className="ctc-main-layout">
                  <div className="ctc-left-column">
                    {/* COUNTRY & PAYROLL SETUP */}
                    <section className="hrms-form-section-card ctc-card ctc-country-card">
                      <div className="ctc-country-header">
                        <h3 className="ctc-section-title">
                          Country &amp; payroll setup
                        </h3>

                        <p className="ctc-country-description">
                          Picks statutory rules, currency, tax regime and pay
                          cycle
                        </p>
                      </div>

                      <div className="ctc-country-options">
                        {countries.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            className={`ctc-country-option ${
                              selectedCountry === country.label ? "active" : ""
                            }`}
                            onClick={() => setSelectedCountry(country.label)}
                          >
                            <span className="ctc-country-code">
                              {country.code}
                            </span>
                            <span>{country.label}</span>
                          </button>
                        ))}

                        <button
                          type="button"
                          className="ctc-country-option ctc-more-countries"
                          onClick={() =>
                            alert(
                              "Additional country options can be added here.",
                            )
                          }
                        >
                          + 24
                        </button>
                      </div>
                    </section>

                    {/* SALARY TYPE AND CTC SETTINGS */}
                    <section className="hrms-form-section-card ctc-card">
                      <div className="ctc-salary-type">
                        <label className="hrms-form-label">Salary type</label>

                        <div className="ctc-salary-options">
                          {[
                            "Daily",
                            "Weekly",
                            "15 Days",
                            "Monthly",
                            "Bi-Annual",
                            "Annual",
                          ].map((type) => (
                            <button
                              type="button"
                              key={type}
                              className={`ctc-salary-option ${
                                salaryType === type ? "active" : ""
                              }`}
                              onClick={() => setSalaryType(type)}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="ctc-settings-grid">
                        <div className="hrms-form-group">
                          <FormInput
                            label="Annual CTC (₹)"
                            name="annualCTC"
                            value={formData.annualCTC}
                            onChange={handleChange}
                            type="number"
                            min="0"
                            step="any"
                            onKeyDown={(e) => {
                              if (["-", "+", "e", "E"].includes(e.key)) {
                                e.preventDefault();
                              }
                            }}
                            required
                            error={errors.annualCTC}
                          />
                        </div>

                        <div className="hrms-form-group">
                          <FormInput
                            label="Monthly CTC (₹)"
                            name="monthlyCTC"
                            value={formatAmount(formData.monthlyCTC)}
                            onChange={() => {}}
                            disabled
                            error={errors.monthlyCTC}
                          />
                        </div>

                        <div className="hrms-form-group">
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

                        <div className="hrms-form-group">
                          <FormSelect
                            label="Pay cycle"
                            name="payCycle"
                            value={formData.payCycle}
                            onChange={handleChange}
                            options={payCycleOptions}
                            required
                            error={errors.payCycle}
                          />
                        </div>
                      </div>
                    </section>

                    {/* EARNINGS TABLE COMPONENT */}
                    <EarningsTable
                      earnings={earnings}
                      gross={gross}
                      annualGross={annualGross}
                      formatAmount={formatAmount}
                      handleEarningChange={handleEarningChange}
                      handleAutoSplit={handleAutoSplit}
                    />
                  </div>

                  <div className="ctc-summary-column">
                    {/* LIVE SUMMARY */}
                    <aside className="ctc-summary-card">
                      <h3 className="ctc-summary-heading">
                        LIVE PREVIEW · {salaryType}
                      </h3>

                      <div className="ctc-summary-takehome">
                        <span className="ctc-summary-label">Net take-home</span>

                        <strong className="ctc-summary-amount">
                          ₹{formatAmount(netTakeHome)}
                        </strong>

                        <span className="ctc-summary-percentage">
                          {gross > 0
                            ? ((netTakeHome / gross) * 100).toFixed(1)
                            : "0.0"}
                          % of {String(salaryType).toLowerCase()} CTC
                        </span>
                      </div>

                      {/* COMPOSITION BAR */}
                      <div className="ctc-composition">
                        <div className="ctc-composition-bar">
                          <div
                            className="ctc-bar-earnings"
                            style={{ width: "63.2%" }}
                          />

                          <div
                            className="ctc-bar-employer"
                            style={{ width: "20.0%" }}
                          />

                          <div
                            className="ctc-bar-taxes"
                            style={{ width: "13.5%" }}
                          />
                        </div>
                      </div>

                      {/* SUMMARY LEGEND */}
                      <div className="ctc-summary-breakdown">
                        <div className="ctc-summary-row">
                          <span className="ctc-summary-item-label">
                            <i className="ctc-dot ctc-dot-earnings" />
                            Earnings
                          </span>

                          <strong>₹{formatAmount(gross)}</strong>
                        </div>

                        <div className="ctc-summary-row">
                          <span className="ctc-summary-item-label">
                            <i className="ctc-dot ctc-dot-employer" />
                            Employer PF/Grat.
                          </span>

                          <strong>
                            ₹{formatAmount(employerPF + gratuity)}
                          </strong>
                        </div>

                        <div className="ctc-summary-row">
                          <span className="ctc-summary-item-label">
                            <i className="ctc-dot ctc-dot-taxes" />
                            Deductions + TDS
                          </span>

                          <strong>
                            ₹{formatAmount(employeePF + professionalTax + tds)}
                          </strong>
                        </div>
                      </div>

                      {/* ANNUAL GROSS */}
                      <div className="ctc-summary-annual">
                        <span>Annual gross</span>
                        <strong>₹{formatAmount(annualGross)}</strong>
                      </div>

                      {/* STATUTORY STATUS */}
                      <div className="ctc-summary-compliance">
                        <i className="ctc-dot ctc-dot-earnings" />
                        <span>Statutory compliant</span>
                      </div>
                    </aside>

                    {/* AI SUGGESTION CARD */}
                    <section className="ctc-ai-suggestion-card">
                      <div className="ctc-ai-suggestion-heading">
                        <span className="ctc-ai-icon">AI</span>
                        <span>Radiant AI suggests</span>
                      </div>

                      <div className="ctc-ai-suggestion-content">
                        <h4>Add LTA &amp; Meal card</h4>
                        <p>
                          to save <strong>₹7,250 tax/month</strong>
                        </p>
                      </div>

                      <div className="ctc-ai-suggestion-actions">
                        <button
                          type="button"
                          className="ctc-ai-apply-btn"
                          onClick={() =>
                            alert("LTA & Meal card suggestion applied.")
                          }
                        >
                          Apply
                        </button>

                        <button
                          type="button"
                          className="ctc-ai-details-btn"
                          onClick={() =>
                            alert(
                              "AI suggestion details can be connected here.",
                            )
                          }
                        >
                          See details
                        </button>
                      </div>
                    </section>
                  </div>
                </div>

                {/* DEDUCTION TABLES COMPONENT */}
                <DeductionTables
                  employeeContributions={employeeContributions}
                  employerContributions={employerContributions}
                  handleContributionChange={handleContributionChange}
                  totalEmployeeDeduction={totalEmployeeDeduction}
                  totalEmployerDeduction={totalEmployerDeduction}
                  netPay={netPay}
                />
              </div>
            </section>

            {/* FORM FOOTER */}
            <div className="hrms-form-section-footer">
              <FormButton
                type="button"
                variant="secondary"
                onClick={handleList}
              >
                List
              </FormButton>
              <FormButton type="submit" variant="primary">
                Save
              </FormButton>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

export default CTCDetails;
