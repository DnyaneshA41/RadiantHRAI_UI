import FormInput from "../../../../../../common/components/Form/FormInput";

function EarningsTable({
  earnings,
  gross,
  annualGross,
  formatAmount,
  handleEarningChange,
}) {
  return (
    <section className="ctc-earnings-card">
      <div className="ctc-earnings-header">
        <h3 className="ctc-section-title">Earnings</h3>
      </div>

      <div className="table-wrapper">
        <table className="normal-table">
          <thead>
            <tr>
              <th>Component</th>
              <th>Method</th>
              <th>Monthly</th>
              <th>Annual</th>
            </tr>
          </thead>

          <tbody>
            {earnings.map((item) => (
              <tr key={item.id}>
                <td>{item.component}</td>
                <td className="ctc-method">{item.method}</td>

                <td className="ctc-table-input-cell">
                  <div className="ctc-table-input">
                    <FormInput
                      label=""
                      name={`monthly-${item.id}`}
                      value={item.monthly}
                      onChange={(event) =>
                        handleEarningChange(
                          item.id,
                          "monthly",
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

                <td className="ctc-table-input-cell">
                  <div className="ctc-table-input">
                    <FormInput
                      label=""
                      name={`annual-${item.id}`}
                      value={item.annual}
                      onChange={(event) =>
                        handleEarningChange(
                          item.id,
                          "annual",
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
              <td colSpan="2">Total earnings</td>
              <td className="text-end">₹{formatAmount(gross)}</td>
              <td className="text-end">₹{formatAmount(annualGross)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

export default EarningsTable;
