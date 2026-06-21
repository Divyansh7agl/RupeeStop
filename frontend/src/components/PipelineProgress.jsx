import Icon from "./Icon";

// Maps each pipeline step ID to its SVG icon name
const STEP_ICON = {
  load_profile:         "user",
  planner:              "brain",
  tool_execution:       "wrench",
  specialists_parallel: "bolt",
  devils_advocate:      "flame",
  consensus:            "scale",
  pipeline_complete:    "check",
};

// Spinning SVG loader — used while a step is running
function SpinnerIcon() {
  return (
    <svg
      width="22" height="22" viewBox="0 0 20 20"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      className="pipeline-spin"
      stroke="var(--color-primary-light)"
    >
      <circle cx="10" cy="10" r="7"
        strokeWidth="2.2"
        strokeDasharray="18 26"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PipelineProgress({ steps }) {
  return (
    <div className="rs-glass-card">
      <div className="rs-card-body">
        <div className="component-label">Pipeline Execution</div>

        <div className="pipeline-steps">
          {steps.map((step, i) => (
            <div
              key={step.id}
              className={`pipeline-step-wrap${i < steps.length - 1 ? " has-connector" : ""}`}
            >
              {/* Step node */}
              <div className="pipeline-step">
                <div className={`pipeline-node ${step.status}`}>
                  {step.status === "running" ? (
                    <SpinnerIcon />
                  ) : (
                    <Icon
                      name={STEP_ICON[step.id] ?? "check"}
                      size={20}
                      color={
                        step.status === "completed" ? "var(--color-accent-lime)"
                        : step.status === "failed"   ? "var(--color-red)"
                        : "var(--color-text-muted)"
                      }
                    />
                  )}
                </div>

                <div className={`pipeline-step-label ${step.status}`}>
                  {step.label}
                </div>

                {step.status === "running" && step.details && (
                  <div className="pipeline-step-detail">
                    {step.details.slice(0, 35)}…
                  </div>

                  {/* Label */}
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 12,
                      textAlign: "center",
                      color: labelColor,
                      fontWeight: isPending ? 400 : 600,
                      maxWidth: 86,
                      lineHeight: 1.4,
                      fontFamily: "var(--font-heading)",
                      transition: "color 0.3s ease",
                    }}
                  >
                    {step.label}
                  </div>

                  {/* Running detail */}
                  {isRunningStep && step.details && (
                    <div
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-muted)",
                        textAlign: "center",
                        maxWidth: 100,
                        marginTop: 6,
                        background: "var(--color-surface-2)",
                        padding: "3px 7px",
                        borderRadius: 4,
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {step.details.slice(0, 35)}...
                    </div>
                  )}
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      minWidth: 16,
                      background: isCompleted
                        ? "var(--color-accent-lime)"
                        : "var(--color-border)",
                      transition: "background 0.4s ease",
                      marginBottom: 38,
                      borderRadius: 2,
                    }}
                  />
                )}
              </div>

              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className={`pipeline-connector${step.status === "completed" ? " completed" : ""}`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
