import { useState } from "react";
import { FiUsers } from "react-icons/fi";

import FormSelect from "../../../../../common/components/Form/FormSelect";
import FormButton from "../../../../../common/components/Form/FormButton";
import FormToggleBtn from "../../../../../common/components/FormToggleBtn/FormToggleBtn";
import useSectionAnimation from "../../../../../common/hooks/useSectionAnimation";

import "./ReportingManager.css";

const MODULES = [
  "Attendance",
  "Exit",
  "Helpdesk",
  "Income Tax",
  "Leave",
  "Loan",
  "Reimbursement",
  "Talent Acquisition ATS",
];

const APPROVAL_OPTIONS = [
  { value: "aachal-kant", label: "Aachal Kant - 823" },
  { value: "aadi-kala", label: "Aadi Kala - 121" },
  { value: "krishna", label: "Mr.Krishna - 223443375" },
  { value: "manager-a", label: "Manager A" },
  { value: "manager-b", label: "Manager B" },
];

const createInitialApprovals = () =>
  MODULES.map((module, index) => ({
    id: index + 1,
    module,
    level1: "",
    level2: "",
  }));

function ReportingManager({ employee, onBackToList }) {
  const [approvals, setApprovals] = useState(createInitialApprovals);
  const [isRepManagerOpen, setIsRepManagerOpen] = useState(true);

  const repManagerBodyRef = useSectionAnimation(isRepManagerOpen);

  // Get the current employee's ID.
  const employeeId = String(
    employee?.employeeId ??
      employee?.empId ??
      employee?.id ??
      "",
  );

  // Check whether an option belongs to the current employee.
  const isSelfOption = (option) => {
    if (!employeeId) return false;

    return String(option.value) === employeeId;
  };

  // Handle dropdown changes.
  const handleApprovalChange = (index, field, eventOrValue) => {
    const value = eventOrValue?.target
      ? eventOrValue.target.value
      : (eventOrValue ?? "");

    setApprovals((previous) =>
      previous.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item,
      ),
    );
  };

  // Disable the current employee and the manager selected
  // in the opposite approval level.
  const getOptions = (item, field) => {
    const otherField = field === "level1" ? "level2" : "level1";
    const otherSelectedManager = item[otherField];

    return APPROVAL_OPTIONS.map((option) => ({
      ...option,
      disabled:
        isSelfOption(option) ||
        (Boolean(otherSelectedManager) &&
          option.value === otherSelectedManager),
    }));
  };

  const handleSave = (event) => {
    event.preventDefault();

    // Connect your API here when backend integration is ready.
    console.log("Reporting manager approvals:", approvals);
  };

  const handleCancel = () => {
    setApprovals(createInitialApprovals());
  };

  return (
    <div className="hrms-form-container reporting-manager-page">
      <form className="reporting-manager-form" onSubmit={handleSave}>
        <section className="hrms-form-section-card reporting-manager-section">
          {/* Section Header */}
          <div className="hrms-form-section-header">
            <div className="hrms-section-heading-group">
              <div className="hrms-form-section-icon">
                <FiUsers size={19} />
              </div>

              <div className="hrms-form-section-heading">
                <h3 className="hrms-form-section-title">
                  Reporting Manager
                </h3>

                <div className="employee-information">
                  <span>
                    Mr.Krishna - TS012 (Software developer - UI/UX)
                  </span>
                </div>
              </div>
            </div>

            <FormToggleBtn
              isOpen={isRepManagerOpen}
              onClick={() =>
                setIsRepManagerOpen((previous) => !previous)
              }
            />
          </div>

          <div
            ref={repManagerBodyRef}
            className={`hrms-form-section-collapse ${
              isRepManagerOpen ? "is-open" : ""
            }`}
          >
            <div className="hrms-form-section-body">
              <div className="table-wrapper">
                <table className="normal-table">
                  <thead>
                    <tr>
                      <th className="reporting-manager-sr-column">
                        Sr.No.
                      </th>

                      <th className="reporting-manager-module-column">
                        Module Name
                      </th>

                      <th>Level-1 Approval Name</th>

                      <th>Level-2 Approval Name</th>
                    </tr>
                  </thead>

                  <tbody>
                    {approvals.map((item, index) => (
                      <tr key={item.id}>
                        <td className="reporting-manager-sr-cell">
                          {item.id}
                        </td>

                        <td className="reporting-manager-module-cell">
                          {item.module}
                        </td>

                        <td>
                          <div className="reporting-manager-select">
                            <FormSelect
                              label=""
                              name={`level1-${item.id}`}
                              value={item.level1}
                              onChange={(event) =>
                                handleApprovalChange(
                                  index,
                                  "level1",
                                  event,
                                )
                              }
                              options={getOptions(item, "level1")}
                              placeholder="--Select--"
                            />
                          </div>
                        </td>

                        <td>
                          <div className="reporting-manager-select">
                            <FormSelect
                              label=""
                              name={`level2-${item.id}`}
                              value={item.level2}
                              onChange={(event) =>
                                handleApprovalChange(
                                  index,
                                  "level2",
                                  event,
                                )
                              }
                              options={getOptions(item, "level2")}
                              placeholder="--Select--"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* Form Footer */}
        <div className="hrms-form-section-footer">
          <FormButton
            type="button"
            variant="secondary"
            onClick={onBackToList}
            aria-label="Back to Employee List"
          >
            List
          </FormButton>

          <FormButton type="submit" variant="primary">
            Save
          </FormButton>
        </div>
      </form>
    </div>
  );
}

export default ReportingManager;
