import FormInput from "../../../../../../common/components/Form/FormInput";

function DeductionTables({
  employeeContributions,
  employerContributions,
  handleContributionChange,
  totalEmployeeDeduction,
  totalEmployerDeduction,
  netPay,
}) {
  return (
    <section className="ctc-earnings-card" style={{ marginTop: "12px" }}>
      {/* COMMON CARD HEADER */}
      <div
        className="ctc-earnings-header"
        style={{ borderBottom: "1px solid #dfe5ec" }}
      >
        <h3 className="ctc-section-title">Deductions &amp; contributions</h3>
      </div>

      {/* BOTH TABLES IN THE SAME CARD */}
      <div className="ctc-contributions-row">
        {/* EMPLOYEE CONTRIBUTIONS */}
        <div>
          <div className="ctc-earnings-header">
            <h3 className="ctc-section-title">Employee</h3>
          </div>

          <div className="table-wrapper">
            <table className="normal-table ctc-contribution-table">
              <thead>
                <tr>
                  <th>Components</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>

              <tbody>
                {employeeContributions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.component === "PF"
                        ? "PF (12% of Basic)"
                        : item.component === "PT"
                          ? "Professional tax"
                          : item.component === "TDS"
                            ? "TDS (projected)"
                            : item.component}
                    </td>

                    <td>
                      <div className="ctc-contribution-input">
                        <FormInput
                          label=""
                          name={`employeeContribution-${item.id}`}
                          value={item.amount}
                          onChange={(event) =>
                            handleContributionChange(
                              "employee",
                              item.id,
                              event.target.value,
                            )
                          }
                          type="number"
                          min="0"
                          step="any"
                          onKeyDown={(e) => {
                            if (["-", "+", "e", "E"].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td>Total employee</td>
                  <td className="text-end ctc-employee-total">
                    ₹
                    {Number(totalEmployeeDeduction || 0).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* EMPLOYER CONTRIBUTIONS */}
        <div>
          <div className="ctc-earnings-header">
            <h3 className="ctc-section-title">Employer</h3>
          </div>

          <div className="table-wrapper">
            <table className="normal-table ctc-contribution-table">
              <thead>
                <tr>
                  <th>Components</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>

              <tbody>
                {employerContributions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      {item.component === "PF"
                        ? "PF contribution"
                        : item.component}
                    </td>

                    <td>
                      <div className="ctc-contribution-input">
                        <FormInput
                          label=""
                          name={`employerContribution-${item.id}`}
                          value={item.amount}
                          onChange={(event) =>
                            handleContributionChange(
                              "employer",
                              item.id,
                              event.target.value,
                            )
                          }
                          type="number"
                          min="0"
                          step="any"
                          onKeyDown={(e) => {
                            if (["-", "+", "e", "E"].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr>
                  <td>Total employer</td>
                  <td className="text-end ctc-employer-total">
                    ₹
                    {Number(totalEmployerDeduction || 0).toLocaleString(
                      "en-IN",
                      {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      },
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default DeductionTables;
