"use client";

import { useState } from "react";

const MODELS = [
  { id: "gemini-3-flash-preview", label: "Gemini 3 Flash (Free)" },
  { id: "gemini-3-pro-preview", label: "Gemini 3 Pro" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
];

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.09 8.26L20.5 9L15.75 13.14L17.18 19.5L12 16.27L6.82 19.5L8.25 13.14L3.5 9L9.91 8.26L12 2Z"
        fill="currentColor" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [model, setModel] = useState("gemini-3-flash-preview");
  const [temperature, setTemperature] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleHumanize = async () => {
    if (!input.trim() || isLoading) return;
    setIsLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("/api/humanize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, model, temperature }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
    setError("");
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      handleHumanize();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#09090b", color: "#fafafa" }}
    >
      {/* ── Header ── */}
      <header
        style={{
          borderBottom: "1px solid #27272a",
          padding: "0 24px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(9, 9, 11, 0.85)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <SparkleIcon />
          </div>
          <span style={{ fontWeight: 600, fontSize: "15px", letterSpacing: "-0.01em" }}>
            Humanizer
          </span>
          <span
            style={{
              fontSize: "11px",
              background: "#27272a",
              color: "#a1a1aa",
              padding: "2px 7px",
              borderRadius: "99px",
              fontWeight: 500,
            }}
          >
            beta
          </span>
        </div>

        <p style={{ color: "#71717a", fontSize: "13px", display: "none" }}
          className="md-tagline">
          Turn AI text into natural, human-sounding prose
        </p>

        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            color: "#71717a",
            fontSize: "13px",
            textDecoration: "none",
            padding: "5px 10px",
            borderRadius: "7px",
            border: "1px solid #27272a",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#a1a1aa";
            e.currentTarget.style.borderColor = "#3f3f46";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#71717a";
            e.currentTarget.style.borderColor = "#27272a";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          GitHub
        </a>
      </header>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          maxWidth: "1280px",
          width: "100%",
          margin: "0 auto",
          padding: "24px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Panels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            flex: 1,
          }}
          className="panels-grid"
        >
          {/* ── Input panel ── */}
          <Panel label="Original Text">
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste your AI-generated text here…"
                spellCheck={false}
                style={{
                  flex: 1,
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  resize: "none",
                  color: "#e4e4e7",
                  fontSize: "13.5px",
                  lineHeight: "1.7",
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  padding: "16px",
                  minHeight: "340px",
                }}
              />
              <PanelFooter left={`${wordCount(input)} words · ${input.length} chars`}>
                {input && (
                  <button onClick={handleClear} className="footer-btn">
                    Clear
                  </button>
                )}
              </PanelFooter>
            </div>
          </Panel>

          {/* ── Output panel ── */}
          <Panel label="Humanized">
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  flex: 1,
                  padding: "16px",
                  overflowY: "auto",
                  minHeight: "340px",
                  position: "relative",
                }}
              >
                {/* Empty state */}
                {!output && !isLoading && !error && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "10px",
                      color: "#3f3f46",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "10px",
                      border: "1px dashed #3f3f46",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <SparkleIcon />
                    </div>
                    <span style={{ fontSize: "13px" }}>Output will appear here</span>
                  </div>
                )}

                {/* Loading skeleton */}
                {isLoading && !output && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "2px 0" }}>
                    {[90, 100, 75, 100, 60].map((w, i) => (
                      <div
                        key={i}
                        style={{
                          height: "13px",
                          width: `${w}%`,
                          background: "linear-gradient(90deg, #27272a 25%, #3f3f46 50%, #27272a 75%)",
                          backgroundSize: "200% 100%",
                          borderRadius: "4px",
                          animation: `shimmer 1.4s ease-in-out ${i * 0.08}s infinite`,
                        }}
                      />
                    ))}
                    <style>{`
                      @keyframes shimmer {
                        0% { background-position: 200% 0; }
                        100% { background-position: -200% 0; }
                      }
                    `}</style>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div
                    className="fade-in"
                    style={{
                      color: "#f87171",
                      fontSize: "13px",
                      background: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.15)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      lineHeight: "1.5",
                    }}
                  >
                    {error}
                  </div>
                )}

                {/* Output text */}
                {output && (
                  <p
                    className="fade-in"
                    style={{
                      color: "#e4e4e7",
                      fontSize: "13.5px",
                      lineHeight: "1.7",
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      whiteSpace: "pre-wrap",
                      margin: 0,
                    }}
                  >
                    {output}
                    {isLoading && (
                      <span
                        className="cursor-blink"
                        style={{
                          display: "inline-block",
                          width: "2px",
                          height: "14px",
                          background: "#8b5cf6",
                          marginLeft: "2px",
                          verticalAlign: "text-bottom",
                          borderRadius: "1px",
                        }}
                      />
                    )}
                  </p>
                )}
              </div>

              <PanelFooter left={output ? `${wordCount(output)} words · ${output.length} chars` : ""}>
                {output && (
                  <button onClick={handleCopy} className={`footer-btn ${copied ? "copied" : ""}`}
                    style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    {copied ? <CheckIcon /> : <CopyIcon />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                )}
              </PanelFooter>
            </div>
          </Panel>
        </div>

        {/* ── Controls bar ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "12px",
            padding: "10px 16px",
            flexWrap: "wrap",
          }}
        >
          {/* Model select */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label style={{ fontSize: "12px", color: "#71717a", whiteSpace: "nowrap" }}>Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              style={{
                background: "#27272a",
                border: "1px solid #3f3f46",
                color: "#d4d4d8",
                fontSize: "12px",
                padding: "5px 10px",
                borderRadius: "7px",
                outline: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "20px", background: "#27272a", flexShrink: 0 }} />

          {/* Temperature */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "160px" }}>
            <label style={{ fontSize: "12px", color: "#71717a", whiteSpace: "nowrap" }}>Creativity</label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "#8b5cf6", cursor: "pointer" }}
            />
            <span
              style={{
                fontSize: "12px",
                color: "#a1a1aa",
                fontFamily: "monospace",
                width: "28px",
                textAlign: "right",
                flexShrink: 0,
              }}
            >
              {temperature.toFixed(1)}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: "1px", height: "20px", background: "#27272a", flexShrink: 0 }} />

          {/* Keyboard hint */}
          <span style={{ fontSize: "11px", color: "#52525b", whiteSpace: "nowrap" }}>⌘ Enter</span>

          {/* Humanize button */}
          <button
            onClick={handleHumanize}
            disabled={!input.trim() || isLoading}
            style={{
              marginLeft: "auto",
              padding: "8px 20px",
              borderRadius: "8px",
              background: isLoading || !input.trim()
                ? "#27272a"
                : "linear-gradient(135deg, #7c3aed, #4f46e5)",
              color: isLoading || !input.trim() ? "#52525b" : "white",
              fontSize: "13px",
              fontWeight: 500,
              border: "none",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              transition: "opacity 0.15s, transform 0.1s",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
              boxShadow: !isLoading && input.trim() ? "0 0 20px rgba(124, 58, 237, 0.3)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isLoading && input.trim()) e.currentTarget.style.opacity = "0.88";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
            onMouseDown={(e) => {
              if (!isLoading && input.trim()) e.currentTarget.style.transform = "scale(0.97)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {isLoading ? (
              <>
                <span style={{
                  width: "12px", height: "12px", border: "1.5px solid #52525b",
                  borderTopColor: "#a1a1aa", borderRadius: "50%",
                  display: "inline-block", animation: "spin 0.7s linear infinite"
                }} />
                Rewriting…
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </>
            ) : (
              <>
                <SparkleIcon />
                Humanize
              </>
            )}
          </button>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: "1px solid #18181b",
          padding: "14px 24px",
          textAlign: "center",
          fontSize: "12px",
          color: "#3f3f46",
        }}
      >
        Powered by Google Gemini · Output is AI-generated and may require review
      </footer>

      <style>{`
        .panels-grid {
          min-height: 0;
        }

        @media (max-width: 768px) {
          .panels-grid {
            grid-template-columns: 1fr !important;
          }
        }

        .footer-btn {
          background: transparent;
          border: none;
          color: #71717a;
          font-size: 12px;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 4px;
          font-family: inherit;
          transition: color 0.15s;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .footer-btn:hover {
          color: #a1a1aa;
        }

        .footer-btn.copied {
          color: #34d399;
        }
      `}</style>
    </div>
  );
}

function Panel({ label, children }) {
  return (
    <div
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: "12px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid #27272a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 500,
            color: "#71717a",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function PanelFooter({ left, children }) {
  return (
    <div
      style={{
        padding: "8px 16px",
        borderTop: "1px solid #27272a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "36px",
      }}
    >
      <span style={{ fontSize: "11px", color: "#3f3f46", fontFamily: "monospace" }}>
        {left}
      </span>
      <div>{children}</div>
    </div>
  );
}
