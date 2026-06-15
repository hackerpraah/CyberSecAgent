import { useState, useEffect, useRef, useCallback } from "react";

const GITHUB_API = "https://api.github.com";
const REPO = "mukul975/Anthropic-Cybersecurity-Skills";
const RAW_BASE = "https://raw.githubusercontent.com/mukul975/Anthropic-Cybersecurity-Skills/main";

// ─── Skill index fetched from GitHub tree API ────────────────────────────────
async function fetchSkillIndex() {
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/git/trees/main?recursive=1`);
  const data = await res.json();
  // Extract all SKILL.md paths → skill slugs
  const skills = (data.tree || [])
    .filter(f => f.path.endsWith("/SKILL.md") && f.path.startsWith("skills/"))
    .map(f => {
      const slug = f.path.replace("skills/", "").replace("/SKILL.md", "");
      const label = slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
      return { slug, label, path: f.path };
    });
  return skills;
}

// ─── Fetch a single SKILL.md ─────────────────────────────────────────────────
async function fetchSkillContent(slug) {
  const res = await fetch(`${RAW_BASE}/skills/${slug}/SKILL.md`);
  if (!res.ok) throw new Error(`Failed to load skill: ${slug}`);
  return res.text();
}

// ─── Parse YAML frontmatter ──────────────────────────────────────────────────
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return { body: raw, meta: {} };
  const yaml = match[1];
  const body = raw.slice(match[0].length).trim();
  const meta = {};
  yaml.split("\n").forEach(line => {
    const [k, ...v] = line.split(":");
    if (k && v.length) meta[k.trim()] = v.join(":").trim().replace(/^>$/, "");
  });
  return { body, meta };
}

// ─── Call Anthropic API with skill context ───────────────────────────────────
async function callClaude(messages, skillContent) {
  const systemPrompt = skillContent
    ? `You are an expert cybersecurity AI agent. You have been loaded with the following skill knowledge:\n\n${skillContent}\n\nUse this skill knowledge to guide your responses. Be precise, actionable, and practitioner-focused. When providing commands or scripts, make them production-ready.`
    : `You are an expert cybersecurity AI agent with deep knowledge across offensive security, defensive security, cloud security, DevSecOps, threat intelligence, incident response, and compliance frameworks (MITRE ATT&CK, NIST CSF 2.0, D3FEND, NIST AI RMF). Provide precise, actionable guidance.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    }),
  });
  const data = await res.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("");
  return text || "No response from model.";
}

// ─── Markdown-ish renderer (minimal) ────────────────────────────────────────
function Markdown({ text }) {
  const lines = text.split("\n");
  let inCode = false;
  let codeLines = [];
  const elements = [];
  let key = 0;

  const flush = () => {
    if (codeLines.length) {
      elements.push(
        <pre key={key++} style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-md)", padding: "10px 14px", fontSize: 12, overflowX: "auto", lineHeight: 1.6, fontFamily: "var(--font-mono)", margin: "8px 0" }}>
          <code>{codeLines.join("\n")}</code>
        </pre>
      );
      codeLines = [];
    }
  };

  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) { flush(); inCode = false; }
      else inCode = true;
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    if (line.startsWith("### ")) {
      elements.push(<h3 key={key++} style={{ fontSize: 13, fontWeight: 500, margin: "14px 0 4px", color: "var(--color-text-primary)" }}>{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={key++} style={{ fontSize: 14, fontWeight: 500, margin: "16px 0 4px", color: "var(--color-text-primary)" }}>{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={key++} style={{ fontSize: 15, fontWeight: 500, margin: "16px 0 6px", color: "var(--color-text-primary)" }}>{line.slice(2)}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(<div key={key++} style={{ fontSize: 13, lineHeight: 1.6, color: "var(--color-text-primary)", paddingLeft: 12 }}>• {line.slice(2)}</div>);
    } else if (line.trim() === "") {
      elements.push(<div key={key++} style={{ height: 6 }} />);
    } else {
      // inline code
      const parts = line.split(/(`[^`]+`)/g);
      elements.push(
        <p key={key++} style={{ fontSize: 13, lineHeight: 1.65, color: "var(--color-text-primary)", margin: "2px 0" }}>
          {parts.map((p, i) =>
            p.startsWith("`") && p.endsWith("`")
              ? <code key={i} style={{ fontFamily: "var(--font-mono)", fontSize: 11, background: "var(--color-background-secondary)", padding: "1px 4px", borderRadius: 3 }}>{p.slice(1, -1)}</code>
              : p
          )}
        </p>
      );
    }
  }
  if (inCode) flush();
  return <>{elements}</>;
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CybersecAgent() {
  const [skills, setSkills] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(true);
  const [indexError, setIndexError] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillContent, setSkillContent] = useState(null);
  const [skillMeta, setSkillMeta] = useState(null);
  const [loadingSkill, setLoadingSkill] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("chat"); // chat | skill
  const [showSkillPanel, setShowSkillPanel] = useState(true);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Load skill index on mount
  useEffect(() => {
    fetchSkillIndex()
      .then(s => { setSkills(s); setLoadingIndex(false); })
      .catch(e => { setIndexError(e.message); setLoadingIndex(false); });
  }, []);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const filtered = skills.filter(s =>
    !search || s.label.toLowerCase().includes(search.toLowerCase()) || s.slug.includes(search.toLowerCase())
  );

  const handleSelectSkill = useCallback(async (skill) => {
    setSelectedSkill(skill);
    setSkillContent(null);
    setSkillMeta(null);
    setLoadingSkill(true);
    setTab("skill");
    try {
      const raw = await fetchSkillContent(skill.slug);
      const { body, meta } = parseFrontmatter(raw);
      setSkillContent(raw);
      setSkillMeta({ ...meta, body });
    } catch (e) {
      setSkillContent(`Error: ${e.message}`);
    } finally {
      setLoadingSkill(false);
    }
  }, []);

  const handleLoadSkillToChat = () => {
    setMessages(prev => [
      ...prev,
      {
        role: "system-note",
        text: `Skill loaded: **${selectedSkill.label}**. The agent now has full context from this skill's workflow, commands, and knowledge base.`,
      },
    ]);
    setTab("chat");
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    const newMsgs = [...messages.filter(m => m.role !== "system-note"), userMsg];
    setMessages(prev => [...prev, { role: "user", text }]);
    setSending(true);
    try {
      const reply = await callClaude(
        newMsgs.map(m => ({ role: m.role, content: m.content || m.text })),
        skillContent
      );
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: `Error: ${e.message}` }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const clearChat = () => { setMessages([]); setSelectedSkill(null); setSkillContent(null); setSkillMeta(null); };

  // ── Layout ────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", height: 680, fontFamily: "var(--font-sans)", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>

      {/* ── Left: Skill Browser ── */}
      {showSkillPanel && (
        <div style={{ width: 240, borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          {/* Header */}
          <div style={{ padding: "12px 14px 10px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <i className="ti ti-shield-lock" aria-hidden="true" style={{ fontSize: 16, color: "var(--color-text-info)" }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Cybersec Skills</span>
              <span style={{ marginLeft: "auto", fontSize: 10, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", padding: "2px 6px", borderRadius: 10 }}>
                {loadingIndex ? "…" : skills.length}
              </span>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search skills…"
              style={{ width: "100%", fontSize: 12, boxSizing: "border-box", padding: "6px 10px" }}
            />
          </div>

          {/* Skill list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {loadingIndex && (
              <div style={{ padding: 16, fontSize: 12, color: "var(--color-text-secondary)", textAlign: "center" }}>
                <i className="ti ti-loader" style={{ fontSize: 16, display: "block", marginBottom: 6 }} />
                Loading 754 skills…
              </div>
            )}
            {indexError && (
              <div style={{ padding: 12, fontSize: 11, color: "var(--color-text-danger)" }}>
                GitHub API error: {indexError}<br />
                <span style={{ color: "var(--color-text-secondary)" }}>Rate limit? Try again in a minute.</span>
              </div>
            )}
            {filtered.slice(0, 200).map(skill => (
              <button
                key={skill.slug}
                onClick={() => handleSelectSkill(skill)}
                style={{
                  display: "block", width: "100%", textAlign: "left", padding: "7px 14px",
                  fontSize: 12, lineHeight: 1.4, cursor: "pointer",
                  background: selectedSkill?.slug === skill.slug ? "var(--color-background-secondary)" : "transparent",
                  color: selectedSkill?.slug === skill.slug ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  border: "none", borderBottom: "0.5px solid var(--color-border-tertiary)",
                  transition: "background 0.1s",
                }}
              >
                {skill.label}
              </button>
            ))}
            {filtered.length > 200 && (
              <div style={{ padding: "8px 14px", fontSize: 11, color: "var(--color-text-secondary)" }}>
                + {filtered.length - 200} more — narrow your search
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Right: Main panel ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", borderBottom: "0.5px solid var(--color-border-tertiary)", flexShrink: 0 }}>
          <button
            onClick={() => setShowSkillPanel(v => !v)}
            title={showSkillPanel ? "Hide skill browser" : "Show skill browser"}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4 }}
          >
            <i className="ti ti-layout-sidebar" aria-hidden="true" style={{ fontSize: 18, color: "var(--color-text-secondary)" }} />
          </button>

          {/* Tabs */}
          {["chat", "skill"].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                fontSize: 12, padding: "4px 12px", borderRadius: "var(--border-radius-md)",
                border: "0.5px solid",
                borderColor: tab === t ? "var(--color-border-primary)" : "var(--color-border-tertiary)",
                background: tab === t ? "var(--color-background-secondary)" : "transparent",
                color: "var(--color-text-primary)", cursor: "pointer",
              }}
            >
              {t === "chat" ? "Chat" : "Skill viewer"}
            </button>
          ))}

          {selectedSkill && (
            <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 4, background: "var(--color-background-info)", color: "var(--color-text-info)", padding: "3px 8px", borderRadius: 10 }}>
              {selectedSkill.label}
            </span>
          )}

          {selectedSkill && tab === "skill" && skillContent && (
            <button
              onClick={handleLoadSkillToChat}
              style={{ marginLeft: "auto", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}
            >
              <i className="ti ti-bolt" aria-hidden="true" style={{ fontSize: 13, verticalAlign: -2 }} /> Use in chat
            </button>
          )}

          {tab === "chat" && messages.length > 0 && (
            <button
              onClick={clearChat}
              style={{ marginLeft: selectedSkill ? 4 : "auto", fontSize: 12, padding: "4px 10px", cursor: "pointer" }}
            >
              <i className="ti ti-trash" aria-hidden="true" style={{ fontSize: 13, verticalAlign: -2 }} /> Clear
            </button>
          )}
        </div>

        {/* ── Chat tab ── */}
        {tab === "chat" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length === 0 && (
                <div style={{ margin: "auto", textAlign: "center", color: "var(--color-text-secondary)" }}>
                  <i className="ti ti-shield-check" aria-hidden="true" style={{ fontSize: 40, display: "block", marginBottom: 12, color: "var(--color-text-tertiary)" }} />
                  <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>Cybersecurity AI Agent</div>
                  <div style={{ fontSize: 12, lineHeight: 1.6, maxWidth: 320 }}>
                    Select a skill from the left panel to load expert playbook context, then ask anything. Or start chatting directly for general security guidance.
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 14 }}>
                    {["Analyze a memory dump for credential theft", "Write a Sigma rule for Kerberoasting", "Audit my Kubernetes RBAC config", "Create a cloud breach scope checklist"].map(q => (
                      <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        style={{ fontSize: 11, padding: "5px 10px", borderRadius: "var(--border-radius-md)", cursor: "pointer", textAlign: "left" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => {
                if (msg.role === "system-note") return (
                  <div key={i} style={{ fontSize: 11, color: "var(--color-text-info)", background: "var(--color-background-info)", padding: "6px 12px", borderRadius: "var(--border-radius-md)", display: "flex", gap: 6, alignItems: "center" }}>
                    <i className="ti ti-bolt" aria-hidden="true" style={{ flexShrink: 0 }} />
                    {msg.text.replace("**", "").replace("**", "")}
                  </div>
                );

                const isUser = msg.role === "user";
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                      background: isUser ? "var(--color-background-info)" : "var(--color-background-secondary)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "0.5px solid var(--color-border-tertiary)",
                    }}>
                      <i className={`ti ${isUser ? "ti-user" : "ti-shield-lock"}`} aria-hidden="true"
                        style={{ fontSize: 13, color: isUser ? "var(--color-text-info)" : "var(--color-text-secondary)" }} />
                    </div>
                    <div style={{
                      maxWidth: "82%", padding: "10px 14px",
                      background: isUser ? "var(--color-background-info)" : "var(--color-background-secondary)",
                      borderRadius: "var(--border-radius-lg)",
                      border: "0.5px solid var(--color-border-tertiary)",
                    }}>
                      {isUser
                        ? <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0, color: "var(--color-text-primary)" }}>{msg.text}</p>
                        : <Markdown text={msg.text} />
                      }
                    </div>
                  </div>
                );
              })}

              {sending && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--color-background-secondary)", display: "flex", alignItems: "center", justifyContent: "center", border: "0.5px solid var(--color-border-tertiary)" }}>
                    <i className="ti ti-shield-lock" aria-hidden="true" style={{ fontSize: 13, color: "var(--color-text-secondary)" }} />
                  </div>
                  <div style={{ padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)" }}>
                    <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Analyzing…</span>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: "10px 14px", borderTop: "0.5px solid var(--color-border-tertiary)", display: "flex", gap: 8, alignItems: "flex-end" }}>
              {selectedSkill && (
                <div style={{ fontSize: 10, color: "var(--color-text-info)", background: "var(--color-background-info)", padding: "2px 8px", borderRadius: 10, flexShrink: 0, alignSelf: "center" }}>
                  <i className="ti ti-bolt" style={{ fontSize: 10, verticalAlign: -1 }} /> {selectedSkill.label.slice(0, 22)}{selectedSkill.label.length > 22 ? "…" : ""}
                </div>
              )}
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a security question… (Enter to send, Shift+Enter for newline)"
                rows={2}
                style={{ flex: 1, resize: "none", fontSize: 13, fontFamily: "var(--font-sans)", padding: "8px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{ padding: "8px 16px", cursor: sending || !input.trim() ? "not-allowed" : "pointer", opacity: sending || !input.trim() ? 0.5 : 1, alignSelf: "flex-end" }}
              >
                <i className="ti ti-send" aria-hidden="true" style={{ fontSize: 15, verticalAlign: -2 }} />
              </button>
            </div>
          </>
        )}

        {/* ── Skill viewer tab ── */}
        {tab === "skill" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {!selectedSkill && (
              <div style={{ textAlign: "center", color: "var(--color-text-secondary)", paddingTop: 60 }}>
                <i className="ti ti-books" aria-hidden="true" style={{ fontSize: 36, display: "block", marginBottom: 10 }} />
                <div style={{ fontSize: 13 }}>Select a skill from the left panel to view its full playbook</div>
              </div>
            )}
            {selectedSkill && loadingSkill && (
              <div style={{ textAlign: "center", color: "var(--color-text-secondary)", paddingTop: 60 }}>
                <i className="ti ti-loader" aria-hidden="true" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
                <div style={{ fontSize: 13 }}>Loading skill…</div>
              </div>
            )}
            {selectedSkill && !loadingSkill && skillMeta && (
              <>
                {/* Skill meta card */}
                <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 18px", marginBottom: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>{selectedSkill.label}</div>
                  {skillMeta.description && (
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: "var(--color-text-secondary)", margin: "0 0 10px" }}>
                      {skillMeta.description.replace(/^>\s*/gm, "").trim()}
                    </p>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {skillMeta.domain && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--color-background-info)", color: "var(--color-text-info)" }}>{skillMeta.domain}</span>}
                    {skillMeta.subdomain && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>{skillMeta.subdomain}</span>}
                    {skillMeta.tags && skillMeta.tags.replace(/[\[\]]/g, "").split(",").map(t => (
                      <span key={t} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <button onClick={handleLoadSkillToChat} style={{ fontSize: 12, padding: "5px 14px", cursor: "pointer" }}>
                      <i className="ti ti-bolt" aria-hidden="true" style={{ fontSize: 12, verticalAlign: -1 }} /> Load into chat context
                    </button>
                    <a
                      href={`https://github.com/${REPO}/blob/main/skills/${selectedSkill.slug}/SKILL.md`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ marginLeft: 8, fontSize: 11, color: "var(--color-text-secondary)", textDecoration: "none" }}
                    >
                      <i className="ti ti-external-link" aria-hidden="true" style={{ fontSize: 11, verticalAlign: -1 }} /> View on GitHub
                    </a>
                  </div>
                </div>

                {/* Skill body */}
                <div style={{ fontSize: 13, lineHeight: 1.65 }}>
                  <Markdown text={skillMeta.body} />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
