"use client";

import { useState } from "react";

const MODELS = [
  { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash", tag: "Fast" },
  { id: "gemini-2.0-flash-thinking-exp", label: "Flash Thinking", tag: null },
  { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash", tag: null },
  { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro", tag: "Best" },
];

function wordCount(t) {
  return t.trim() ? t.trim().split(/\s+/).length : 0;
}

function SparkleIcon({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
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

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [model, setModel] = useState("gemini-2.0-flash");
  const [temperature, setTemperature] = useState(1.4);
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

  const handleClear = () => { setInput(""); setOutput(""); setError(""); };
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") handleHumanize();
  };

  const inputWords = wordCount(input);
  const outputWords = wordCount(output);
  const active = !isLoading && input.trim();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#080810", color: "#f0f0f5" }}>

      {/* ambient glow */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "30%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "20%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
      </div>

      {/* ── Header ── */}
      <header style={{ position: "sticky", top: 0, zIndex: 20, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,16,0.8)", backdropFilter: "blur(16px)", padding: "0 28px", height: "58px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* logo */}
          <div style={{ width: "32px", height: "32px", borderRadius: "9px", background: "linear-gradient(140deg, #8b5cf6 0%, #4f46e5 100%)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", boxShadow: "0 0 16px rgba(139,92,246,0.45)" }}>
            <SparkleIcon size={14} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 700, letterSpacing: "-0.02em", color: "#f4f4f8" }}>Humanizer</span>
          <span style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.04em", background: "rgba(139,92,246,0.15)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.25)", padding: "2px 8px", borderRadius: "99px", textTransform: "uppercase" }}>Beta</span>
        </div>

        <a href="https://github.com/kostslava/humanizer" target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "6px", color: "#71717a", fontSize: "13px", textDecoration: "none", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.07)", transition: "all 0.15s", background: "rgba(255,255,255,0.03)" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#c4b5fd"; e.currentTarget.style.borderColor = "rgba(139,92,246,0.3)"; e.currentTarget.style.background = "rgba(139,92,246,0.07)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#71717a"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>
      </header>

      {/* ── Hero ── */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "44px 20px 32px" }}>
        <h1 style={{ margin: 0, fontSize: "clamp(28px, 5vw, 46px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1, background: "linear-gradient(135deg, #f4f4f8 30%, #9d8dfc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Make AI text sound human.
        </h1>
        <p style={{ margin: "12px auto 0", maxWidth: "460px", fontSize: "15px", color: "#71717a", lineHeight: 1.6 }}>
          Paste your AI-generated text and get back prose that passes GPTZero, Turnitin, and Copyleaks.
        </p>
      </div>

      {/* ── Main ── */}
      <main style={{ position: "relative", zIndex: 1, flex: 1, maxWidth: "1300px", width: "100%", margin: "0 auto", padding: "0 20px 32px", display: "flex", flexDirection: "column", gap: "12px" }}>

        {/* panels */}
        <div className="panels-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>

          {/* Input */}
          <GlassPanel
            label="Original Text"
            badge={inputWords > 0 ? `${inputWords} words` : null}
            action={input ? <FooterBtn onClick={handleClear}>Clear</FooterBtn> : null}
            footer={input ? <StatLine>{input.length} chars</StatLine> : null}
          >
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={"Paste your AI-generated text here…\n\nPress ⌘ Enter to humanize."}
              spellCheck={false}
              style={{ flex: 1, width: "100%", background: "transparent", border: "none", outline: "none", resize: "none", color: "#dddde8", fontSize: "14px", lineHeight: "1.75", fontFamily: "inherit", padding: "20px", minHeight: "320px" }}
            />
          </GlassPanel>

          {/* Output */}
          <GlassPanel
            label="Humanized"
            highlight
            badge={outputWords > 0 ? `${outputWords} words` : null}
            action={output ? (
              <button onClick={handleCopy}
                style={{ display: "flex", alignItems: "center", gap: "5px", background: copied ? "rgba(52,211,153,0.12)" : "rgba(139,92,246,0.12)", border: `1px solid ${copied ? "rgba(52,211,153,0.25)" : "rgba(139,92,246,0.2)"}`, color: copied ? "#34d399" : "#a78bfa", fontSize: "12px", fontWeight: 500, padding: "4px 10px", borderRadius: "7px", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
                {copied ? "Copied!" : "Copy"}
              </button>
            ) : null}
            footer={output && inputWords > 0 ? <StatLine><span style={{ color: outputWords > inputWords ? "#f87171" : "#34d399" }}>{outputWords > inputWords ? "▲" : "▼"} {Math.abs(outputWords - inputWords)} words</span> vs original</StatLine> : null}
          >
            <div style={{ flex: 1, padding: "20px", overflowY: "auto", minHeight: "320px", position: "relative" }}>
              {!output && !isLoading && !error && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", color: "#3f3f52", pointerEvents: "none", userSelect: "none" }}>
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", border: "1px dashed #2e2e42", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <SparkleIcon size={18} />
                  </div>
                  <span style={{ fontSize: "13px" }}>Result will appear here</span>
                </div>
              )}

              {isLoading && !output && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {[92, 100, 78, 100, 65, 88, 45].map((w, i) => (
                    <div key={i} style={{ height: "14px", width: `${w}%`, background: "linear-gradient(90deg, #1e1e2e 25%, #2a2a3e 50%, #1e1e2e 75%)", backgroundSize: "200% 100%", borderRadius: "6px", animation: `shimmer 1.5s ease-in-out ${i * 0.07}s infinite` }} />
                  ))}
                </div>
              )}

              {error && (
                <div className="fade-in" style={{ color: "#fca5a5", fontSize: "13.5px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: "10px", padding: "14px 16px", lineHeight: 1.6 }}>
                  <strong style={{ display: "block", marginBottom: "4px" }}>Something went wrong</strong>
                  {error}
                </div>
              )}

              {output && (
                <p className="fade-in" style={{ color: "#dddde8", fontSize: "14px", lineHeight: "1.75", whiteSpace: "pre-wrap", margin: 0, fontFamily: "inherit" }}>
                  {output}
                  {isLoading && <span className="cursor-blink" style={{ display: "inline-block", width: "2px", height: "15px", background: "#8b5cf6", marginLeft: "2px", verticalAlign: "text-bottom", borderRadius: "1px" }} />}
                </p>
              )}
            </div>
          </GlassPanel>
        </div>

        {/* ── Controls bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "10px 14px", flexWrap: "wrap", backdropFilter: "blur(8px)" }}>

          {/* Model pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "11px", color: "#52526a", fontWeight: 500, marginRight: "2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Model</span>
            {MODELS.map(m => (
              <button key={m.id} onClick={() => setModel(m.id)}
                style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", border: model === m.id ? "1px solid rgba(139,92,246,0.5)" : "1px solid rgba(255,255,255,0.07)", background: model === m.id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)", color: model === m.id ? "#c4b5fd" : "#71717a" }}
                onMouseEnter={e => { if (model !== m.id) { e.currentTarget.style.color = "#a1a1b5"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; } }}
                onMouseLeave={e => { if (model !== m.id) { e.currentTarget.style.color = "#71717a"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; } }}
              >
                {m.label}
                {m.tag && <span style={{ fontSize: "10px", padding: "1px 5px", borderRadius: "99px", background: model === m.id ? "rgba(139,92,246,0.25)" : "rgba(255,255,255,0.06)", color: model === m.id ? "#a78bfa" : "#52526a" }}>{m.tag}</span>}
              </button>
            ))}
          </div>

          <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.07)", flexShrink: 0, margin: "0 2px" }} />

          {/* Temperature */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, minWidth: "180px" }}>
            <span style={{ fontSize: "11px", color: "#52526a", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Creativity</span>
            <input type="range" min="0" max="2" step="0.1" value={temperature}
              onChange={e => setTemperature(parseFloat(e.target.value))}
              style={{ flex: 1, accentColor: "#8b5cf6", cursor: "pointer", height: "4px" }}
            />
            <span style={{ fontSize: "12px", color: "#8b8ba8", fontFamily: "monospace", width: "26px", textAlign: "right", flexShrink: 0 }}>{temperature.toFixed(1)}</span>
          </div>

          <div style={{ width: "1px", height: "22px", background: "rgba(255,255,255,0.07)", flexShrink: 0, margin: "0 2px" }} />

          <span style={{ fontSize: "11px", color: "#3a3a52", whiteSpace: "nowrap" }}>⌘ Enter</span>

          {/* Humanize button */}
          <button onClick={handleHumanize} disabled={!active}
            style={{ marginLeft: "auto", padding: "9px 22px", borderRadius: "10px", background: active ? "linear-gradient(135deg, #7c3aed 0%, #4338ca 100%)" : "rgba(255,255,255,0.04)", color: active ? "white" : "#3a3a52", fontSize: "13.5px", fontWeight: 600, border: active ? "1px solid rgba(139,92,246,0.4)" : "1px solid rgba(255,255,255,0.04)", cursor: active ? "pointer" : "not-allowed", transition: "all 0.15s", display: "flex", alignItems: "center", gap: "7px", whiteSpace: "nowrap", fontFamily: "inherit", boxShadow: active ? "0 0 24px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)" : "none", letterSpacing: "-0.01em" }}
            onMouseEnter={e => { if (active) e.currentTarget.style.boxShadow = "0 0 32px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.2)"; }}
            onMouseLeave={e => { if (active) e.currentTarget.style.boxShadow = "0 0 24px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
            onMouseDown={e => { if (active) e.currentTarget.style.transform = "scale(0.97)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {isLoading ? (
              <>
                <span style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                Rewriting…
              </>
            ) : (
              <>
                <SparkleIcon size={13} />
                Humanize
              </>
            )}
          </button>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.04)", padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
        <span style={{ fontSize: "12px", color: "#2e2e42" }}>Powered by Google Gemini</span>
        <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#2e2e42", flexShrink: 0 }} />
        <span style={{ fontSize: "12px", color: "#2e2e42" }}>Output may require review</span>
      </footer>

      <style>{`
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fade-in { from { opacity: 0; transform: translateY(3px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fade-in 0.2s ease-out; }
        @keyframes cursor-blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .cursor-blink { animation: cursor-blink 0.9s step-end infinite; }
        textarea::placeholder { color: #2e2e42; line-height: 1.75; }
        textarea { caret-color: #8b5cf6; }
        @media (max-width: 768px) { .panels-grid { grid-template-columns: 1fr !important; } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 99px; }
      `}</style>
    </div>
  );
}

function GlassPanel({ label, highlight, badge, action, footer, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", background: highlight ? "rgba(139,92,246,0.04)" : "rgba(255,255,255,0.025)", border: `1px solid ${highlight ? "rgba(139,92,246,0.18)" : "rgba(255,255,255,0.07)"}`, borderRadius: "16px", overflow: "hidden", backdropFilter: "blur(8px)" }}>
      {/* header */}
      <div style={{ padding: "12px 18px", borderBottom: `1px solid ${highlight ? "rgba(139,92,246,0.12)" : "rgba(255,255,255,0.06)"}`, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "44px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "11px", fontWeight: 600, color: highlight ? "#7c6af0" : "#52526a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
          {badge && <span style={{ fontSize: "11px", color: "#52526a", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", padding: "1px 7px", borderRadius: "99px" }}>{badge}</span>}
        </div>
        <div>{action}</div>
      </div>
      {/* body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
      {/* footer */}
      {footer && (
        <div style={{ padding: "8px 18px", borderTop: "1px solid rgba(255,255,255,0.04)", minHeight: "34px", display: "flex", alignItems: "center" }}>
          {footer}
        </div>
      )}
    </div>
  );
}

function FooterBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: "transparent", border: "none", color: "#52526a", fontSize: "12px", cursor: "pointer", padding: "3px 6px", borderRadius: "5px", fontFamily: "inherit", transition: "color 0.15s" }}
      onMouseEnter={e => e.currentTarget.style.color = "#a1a1b5"}
      onMouseLeave={e => e.currentTarget.style.color = "#52526a"}
    >{children}</button>
  );
}

function StatLine({ children }) {
  return <span style={{ fontSize: "11px", color: "#3a3a52", fontFamily: "monospace" }}>{children}</span>;
}
