import { User, Lightbulb, Settings, Users, Flame, Scale, CheckCircle2 } from "lucide-react";

const STEP_ICONS = {
  load_profile: <User size={20} />,
  planner: <Lightbulb size={20} />,
  tool_execution: <Settings size={20} />,
  specialists_parallel: <Users size={20} />,
  devils_advocate: <Flame size={20} />,
  consensus: <Scale size={20} />,
  pipeline_complete: <CheckCircle2 size={20} />,
};

export default function PipelineProgress({ steps, isRunning }) {
  return (
    <div className="rs-glass-card">
      <div className="rs-card-body">
        {/* Title */}
        <div
          style={{
            fontSize: 12,
            color: "var(--color-text-main)",
            fontWeight: 700,
            marginBottom: 32,
            letterSpacing: "1.2px",
            fontFamily: "var(--font-heading)",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          {isRunning && (
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--color-primary)",
                animation: "tealPulse 1.5s infinite",
              }}
            />
          )}
          Pipeline Execution
        </div>

        {/* Steps */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            overflowX: "auto",
            paddingBottom: 8,
          }}
        >
          {steps.map((step, i) => {
            const isCompleted = step.status === "completed";
            const isRunningStep = step.status === "running";
            const isPending = step.status === "pending";

            const circleColor = isCompleted
              ? "var(--color-accent-lime)"
              : isRunningStep
              ? "var(--color-primary)"
              : "var(--color-border)";

            const circleBg = isCompleted
              ? "rgba(0, 238, 103, 0.1)"
              : isRunningStep
              ? "rgba(13, 148, 136, 0.12)"
              : "var(--color-surface-2)";

            const labelColor = isCompleted
              ? "var(--color-text-main)"
              : isRunningStep
              ? "var(--color-primary)"
              : "var(--color-text-muted)";

            return (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < steps.length - 1 ? 1 : 0,
                }}
              >
                {/* Step node */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    minWidth: 96,
                  }}
                >
                  {/* Circle */}
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      backgroundColor: circleBg,
                      border: `2px solid ${circleColor}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      transition: "all 0.3s ease",
                      animation: isRunningStep ? "tealPulse 1.5s infinite" : "none",
                      transform: isRunningStep ? "scale(1.08)" : "scale(1)",
                    }}
                  >
                    {isRunningStep ? (
                      <span
                        style={{
                          animation: "spin 1.2s linear infinite",
                          display: "inline-block",
                          color: "var(--color-primary)",
                          fontSize: 22,
                        }}
                      >
                        ⟳
                      </span>
                    ) : (
                      STEP_ICONS[step.id]
                    )}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
