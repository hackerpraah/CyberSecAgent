import { useState, useRef, useCallback } from "react";

// ── Skill index — baked in (no network needed for sidebar) ───────────────────
const SKILLS = [
  // DFIR
  { name: "acquiring-disk-image-with-dd-and-dcfldd", d: "DFIR" },
  { name: "performing-memory-forensics-with-volatility3", d: "DFIR" },
  { name: "analyzing-memory-with-winpmem-and-rekall", d: "DFIR" },
  { name: "building-incident-response-playbook", d: "DFIR" },
  { name: "performing-network-forensics-with-wireshark", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-lateral-movement", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-credential-access", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-privilege-escalation", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-persistence", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-defense-evasion", d: "DFIR" },
  { name: "performing-email-header-analysis-for-phishing", d: "DFIR" },
  { name: "building-evidence-chain-of-custody-documentation", d: "DFIR" },
  { name: "performing-browser-forensics-with-hindsight", d: "DFIR" },
  { name: "analyzing-prefetch-files-for-execution-artifacts", d: "DFIR" },
  { name: "recovering-deleted-files-with-autopsy", d: "DFIR" },
  { name: "performing-registry-forensics-for-persistence", d: "DFIR" },
  { name: "analyzing-linux-artifacts-for-compromise-indicators", d: "DFIR" },
  { name: "performing-triage-with-velociraptor", d: "DFIR" },
  { name: "analyzing-mft-with-mftecmd", d: "DFIR" },
  { name: "performing-log-correlation-with-splunk", d: "DFIR" },
  { name: "conducting-post-incident-review", d: "DFIR" },
  { name: "performing-ransomware-incident-response", d: "DFIR" },
  { name: "performing-business-email-compromise-investigation", d: "DFIR" },
  { name: "performing-cloud-forensics-for-aws", d: "DFIR" },
  { name: "performing-cloud-forensics-for-azure", d: "DFIR" },
  { name: "performing-cloud-forensics-for-gcp", d: "DFIR" },
  // Threat Hunting
  { name: "hunting-for-credential-dumping-lsass", d: "Threat Hunting" },
  { name: "hunting-for-command-and-control-beaconing", d: "Threat Hunting" },
  { name: "hunting-for-living-off-the-land-binaries", d: "Threat Hunting" },
  { name: "hunting-for-lateral-movement-with-wmi", d: "Threat Hunting" },
  { name: "hunting-for-kerberoasting-attacks", d: "Threat Hunting" },
  { name: "hunting-for-as-rep-roasting", d: "Threat Hunting" },
  { name: "hunting-for-dcsync-attacks", d: "Threat Hunting" },
  { name: "hunting-for-pass-the-hash-attacks", d: "Threat Hunting" },
  { name: "hunting-for-pass-the-ticket-attacks", d: "Threat Hunting" },
  { name: "hunting-for-golden-ticket-attacks", d: "Threat Hunting" },
  { name: "hunting-for-powershell-obfuscation", d: "Threat Hunting" },
  { name: "hunting-for-malicious-macro-execution", d: "Threat Hunting" },
  { name: "hunting-for-process-injection", d: "Threat Hunting" },
  { name: "hunting-for-scheduled-task-persistence", d: "Threat Hunting" },
  { name: "hunting-for-registry-run-key-persistence", d: "Threat Hunting" },
  { name: "hunting-for-dns-tunneling", d: "Threat Hunting" },
  { name: "hunting-for-web-shell-activity", d: "Threat Hunting" },
  { name: "hunting-for-ransomware-precursors", d: "Threat Hunting" },
  { name: "hunting-for-aws-credential-theft", d: "Threat Hunting" },
  { name: "hunting-for-azure-credential-theft", d: "Threat Hunting" },
  { name: "hunting-for-insider-threat-indicators", d: "Threat Hunting" },
  { name: "hunting-for-supply-chain-compromise", d: "Threat Hunting" },
  { name: "hunting-with-yara-rules", d: "Threat Hunting" },
  { name: "hunting-with-sigma-rules", d: "Threat Hunting" },
  { name: "writing-sigma-rules-for-detection", d: "Threat Hunting" },
  { name: "hunting-for-cobalt-strike-indicators", d: "Threat Hunting" },
  { name: "hunting-for-mimikatz-artifacts", d: "Threat Hunting" },
  // Cloud Security
  { name: "performing-cloud-security-posture-assessment", d: "Cloud Security" },
  { name: "implementing-cloud-security-monitoring", d: "Cloud Security" },
  { name: "auditing-aws-iam-policies-for-least-privilege", d: "Cloud Security" },
  { name: "auditing-azure-rbac-for-excessive-permissions", d: "Cloud Security" },
  { name: "auditing-gcp-iam-for-overprivileged-accounts", d: "Cloud Security" },
  { name: "implementing-aws-security-hub-automation", d: "Cloud Security" },
  { name: "implementing-azure-security-center-policies", d: "Cloud Security" },
  { name: "implementing-gcp-security-command-center", d: "Cloud Security" },
  { name: "securing-aws-s3-buckets-for-data-protection", d: "Cloud Security" },
  { name: "securing-azure-storage-accounts", d: "Cloud Security" },
  { name: "securing-gcp-cloud-storage-buckets", d: "Cloud Security" },
  { name: "implementing-aws-guardduty-for-threat-detection", d: "Cloud Security" },
  { name: "implementing-azure-defender-for-cloud", d: "Cloud Security" },
  { name: "implementing-aws-cloudtrail-for-audit-logging", d: "Cloud Security" },
  { name: "implementing-azure-monitor-for-security-logging", d: "Cloud Security" },
  { name: "securing-aws-lambda-functions", d: "Cloud Security" },
  { name: "securing-azure-functions-and-app-service", d: "Cloud Security" },
  { name: "securing-aws-eks-clusters", d: "Cloud Security" },
  { name: "securing-azure-aks-clusters", d: "Cloud Security" },
  { name: "securing-gke-clusters", d: "Cloud Security" },
  { name: "implementing-cloud-network-segmentation", d: "Cloud Security" },
  { name: "implementing-secrets-management-with-hashicorp-vault", d: "Cloud Security" },
  { name: "implementing-aws-secrets-manager", d: "Cloud Security" },
  { name: "implementing-azure-key-vault-policies", d: "Cloud Security" },
  { name: "performing-aws-penetration-testing", d: "Cloud Security" },
  { name: "performing-azure-penetration-testing", d: "Cloud Security" },
  { name: "performing-gcp-penetration-testing", d: "Cloud Security" },
  { name: "implementing-cspm-with-prisma-cloud", d: "Cloud Security" },
  // Container Security
  { name: "performing-kubernetes-penetration-testing", d: "Container Security" },
  { name: "auditing-kubernetes-rbac-configurations", d: "Container Security" },
  { name: "implementing-kubernetes-network-policies", d: "Container Security" },
  { name: "scanning-container-images-with-trivy", d: "Container Security" },
  { name: "implementing-pod-security-standards", d: "Container Security" },
  { name: "securing-kubernetes-api-server", d: "Container Security" },
  { name: "implementing-runtime-security-with-falco", d: "Container Security" },
  { name: "hardening-docker-daemon-configuration", d: "Container Security" },
  { name: "implementing-image-signing-with-cosign", d: "Container Security" },
  { name: "implementing-opa-gatekeeper-for-policy-enforcement", d: "Container Security" },
  { name: "performing-container-escape-detection", d: "Container Security" },
  { name: "auditing-helm-chart-security", d: "Container Security" },
  { name: "implementing-service-mesh-security-with-istio", d: "Container Security" },
  // DevSecOps
  { name: "implementing-github-advanced-security-for-code-scanning", d: "DevSecOps" },
  { name: "implementing-sast-with-semgrep", d: "DevSecOps" },
  { name: "implementing-dast-with-owasp-zap", d: "DevSecOps" },
  { name: "implementing-sca-with-dependency-check", d: "DevSecOps" },
  { name: "implementing-secret-scanning-in-ci-cd", d: "DevSecOps" },
  { name: "implementing-iac-security-scanning-with-checkov", d: "DevSecOps" },
  { name: "implementing-sbom-generation-and-management", d: "DevSecOps" },
  { name: "securing-jenkins-pipelines", d: "DevSecOps" },
  { name: "securing-github-actions-workflows", d: "DevSecOps" },
  { name: "implementing-shift-left-security-in-sdlc", d: "DevSecOps" },
  { name: "performing-secure-code-review", d: "DevSecOps" },
  { name: "implementing-security-gates-in-ci-cd", d: "DevSecOps" },
  { name: "performing-threat-modeling-with-stride", d: "DevSecOps" },
  // Penetration Testing
  { name: "performing-external-network-penetration-testing", d: "Pen Testing" },
  { name: "performing-internal-network-penetration-testing", d: "Pen Testing" },
  { name: "performing-web-application-penetration-testing", d: "Pen Testing" },
  { name: "performing-active-directory-penetration-testing", d: "Pen Testing" },
  { name: "performing-wireless-penetration-testing", d: "Pen Testing" },
  { name: "performing-api-penetration-testing", d: "Pen Testing" },
  { name: "performing-social-engineering-assessment", d: "Pen Testing" },
  { name: "writing-penetration-testing-report", d: "Pen Testing" },
  { name: "performing-red-team-operation-planning", d: "Pen Testing" },
  { name: "performing-assumed-breach-assessment", d: "Pen Testing" },
  { name: "using-metasploit-for-exploitation", d: "Pen Testing" },
  { name: "performing-privilege-escalation-on-linux", d: "Pen Testing" },
  { name: "performing-privilege-escalation-on-windows", d: "Pen Testing" },
  { name: "performing-password-spraying-attacks", d: "Pen Testing" },
  { name: "performing-subdomain-enumeration-and-recon", d: "Pen Testing" },
  // Identity Security
  { name: "analyzing-active-directory-acl-abuse", d: "Identity Security" },
  { name: "implementing-privileged-access-workstation", d: "Identity Security" },
  { name: "implementing-tiered-admin-model", d: "Identity Security" },
  { name: "auditing-active-directory-for-misconfigurations", d: "Identity Security" },
  { name: "implementing-laps-for-local-admin-passwords", d: "Identity Security" },
  { name: "implementing-pam-solution-for-privileged-access", d: "Identity Security" },
  { name: "implementing-zero-trust-identity-architecture", d: "Identity Security" },
  { name: "auditing-service-accounts-for-excessive-privileges", d: "Identity Security" },
  { name: "implementing-conditional-access-policies", d: "Identity Security" },
  // Malware Analysis
  { name: "analyzing-android-malware-with-apktool", d: "Malware Analysis" },
  { name: "performing-static-malware-analysis", d: "Malware Analysis" },
  { name: "performing-dynamic-malware-analysis-with-cuckoo", d: "Malware Analysis" },
  { name: "analyzing-malware-with-ghidra", d: "Malware Analysis" },
  { name: "analyzing-pdf-malware", d: "Malware Analysis" },
  { name: "analyzing-office-macro-malware", d: "Malware Analysis" },
  { name: "analyzing-ransomware-samples", d: "Malware Analysis" },
  { name: "analyzing-fileless-malware", d: "Malware Analysis" },
  { name: "building-malware-sandbox-environment", d: "Malware Analysis" },
  { name: "writing-yara-rules-for-malware-detection", d: "Malware Analysis" },
  // Web Security
  { name: "analyzing-api-gateway-access-logs", d: "Web Security" },
  { name: "performing-sql-injection-testing", d: "Web Security" },
  { name: "performing-xss-testing", d: "Web Security" },
  { name: "performing-ssrf-testing", d: "Web Security" },
  { name: "performing-xxe-injection-testing", d: "Web Security" },
  { name: "performing-broken-access-control-testing", d: "Web Security" },
  { name: "performing-jwt-security-testing", d: "Web Security" },
  { name: "performing-graphql-security-testing", d: "Web Security" },
  { name: "implementing-waf-rules-with-modsecurity", d: "Web Security" },
  { name: "implementing-csp-for-web-applications", d: "Web Security" },
  { name: "performing-oauth-security-testing", d: "Web Security" },
  // Mobile Security
  { name: "analyzing-ios-app-security-with-objection", d: "Mobile Security" },
  { name: "performing-android-penetration-testing", d: "Mobile Security" },
  { name: "performing-ios-penetration-testing", d: "Mobile Security" },
  { name: "analyzing-mobile-network-traffic", d: "Mobile Security" },
  // Threat Intelligence
  { name: "evaluating-threat-intelligence-platforms", d: "Threat Intel" },
  { name: "performing-threat-landscape-assessment-for-sector", d: "Threat Intel" },
  { name: "building-threat-intelligence-program", d: "Threat Intel" },
  { name: "performing-mitre-attack-threat-mapping", d: "Threat Intel" },
  { name: "analyzing-threat-actor-ttps", d: "Threat Intel" },
  { name: "building-indicator-of-compromise-feeds", d: "Threat Intel" },
  { name: "performing-dark-web-monitoring", d: "Threat Intel" },
  { name: "analyzing-malware-campaigns-with-mitre-attack", d: "Threat Intel" },
  // Vulnerability Management
  { name: "performing-vulnerability-scanning-with-nessus", d: "Vuln Mgmt" },
  { name: "performing-vulnerability-scanning-with-openvas", d: "Vuln Mgmt" },
  { name: "implementing-vulnerability-management-program", d: "Vuln Mgmt" },
  { name: "prioritizing-vulnerabilities-with-cvss-and-epss", d: "Vuln Mgmt" },
  { name: "implementing-patch-management-process", d: "Vuln Mgmt" },
  { name: "tracking-vulnerabilities-with-jira", d: "Vuln Mgmt" },
  { name: "performing-attack-surface-management", d: "Vuln Mgmt" },
  // Network Security
  { name: "performing-network-security-assessment", d: "Network Security" },
  { name: "implementing-network-segmentation", d: "Network Security" },
  { name: "implementing-ids-ips-with-suricata", d: "Network Security" },
  { name: "implementing-zeek-for-network-monitoring", d: "Network Security" },
  { name: "performing-firewall-rule-audit", d: "Network Security" },
  { name: "performing-dns-security-assessment", d: "Network Security" },
  { name: "detecting-network-anomalies-with-ml", d: "Network Security" },
  // Compliance
  { name: "implementing-pci-dss-controls", d: "Compliance" },
  { name: "implementing-soc2-controls", d: "Compliance" },
  { name: "implementing-iso27001-controls", d: "Compliance" },
  { name: "implementing-nist-csf-2-controls", d: "Compliance" },
  { name: "performing-gdpr-data-protection-assessment", d: "Compliance" },
  { name: "performing-hipaa-security-risk-assessment", d: "Compliance" },
  { name: "building-security-awareness-training-program", d: "Compliance" },
  { name: "performing-third-party-risk-assessment", d: "Compliance" },
  // AI Security
  { name: "performing-ai-model-security-assessment", d: "AI Security" },
  { name: "detecting-prompt-injection-attacks", d: "AI Security" },
  { name: "implementing-llm-security-guardrails", d: "AI Security" },
  { name: "performing-ml-pipeline-security-review", d: "AI Security" },
  { name: "analyzing-ai-agent-attack-vectors", d: "AI Security" },
  { name: "implementing-nist-ai-rmf-controls", d: "AI Security" },
  // OT/ICS
  { name: "performing-ot-network-security-assessment", d: "OT/ICS" },
  { name: "implementing-ics-network-segmentation", d: "OT/ICS" },
  { name: "performing-scada-vulnerability-assessment", d: "OT/ICS" },
  { name: "implementing-ot-security-monitoring", d: "OT/ICS" },
];

const DOMAIN_COLORS = {
  "DFIR": { bg: "#fff3e0", fg: "#e65100" },
  "Threat Hunting": { bg: "#fce4ec", fg: "#880e4f" },
  "Cloud Security": { bg: "#e3f2fd", fg: "#0d47a1" },
  "Container Security": { bg: "#e8f5e9", fg: "#1b5e20" },
  "DevSecOps": { bg: "#f3e5f5", fg: "#4a148c" },
  "Pen Testing": { bg: "#ffebee", fg: "#b71c1c" },
  "Identity Security": { bg: "#e8eaf6", fg: "#1a237e" },
  "Malware Analysis": { bg: "#fbe9e7", fg: "#bf360c" },
  "Web Security": { bg: "#e0f7fa", fg: "#006064" },
  "Mobile Security": { bg: "#f9fbe7", fg: "#558b2f" },
  "Threat Intel": { bg: "#ede7f6", fg: "#311b92" },
  "Vuln Mgmt": { bg: "#fff8e1", fg: "#f57f17" },
  "Network Security": { bg: "#e0f2f1", fg: "#004d40" },
  "Compliance": { bg: "#f1f8e9", fg: "#33691e" },
  "AI Security": { bg: "#e8eaf6", fg: "#283593" },
  "OT/ICS": { bg: "#efebe9", fg: "#3e2723" },
};

// ── Call Claude with skill context injected as system ─────────────────────────
async function callClaude(history, skillContext) {
  const system = skillContext
    ? `You are an expert cybersecurity AI agent. You have been loaded with this skill playbook from the Anthropic-Cybersecurity-Skills library. Use it as your primary reference — be precise, technical, and practitioner-focused.\n\n---SKILL PLAYBOOK---\n${skillContext}\n---END PLAYBOOK---`
    : `You are an expert cybersecurity AI agent with deep knowledge across cloud security (AWS/Azure/GCP), DevSecOps, DFIR, threat hunting, penetration testing, MITRE ATT&CK, NIST CSF 2.0, Kubernetes security, CI/CD security, identity/IAM, and compliance frameworks. Be precise and actionable.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-6", max_tokens: 1000, system, messages: history }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.filter(b => b.type === "text").map(b => b.text).join("");
}

// ── Ask Claude to explain/expand a skill (no external fetch needed) ───────────
async function loadSkillViaAI(skillName) {
  const label = skillName.replace(/-/g, " ");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: `You are an expert cybersecurity engineer. Generate a detailed SKILL.md playbook for the skill: "${label}". 
Format it exactly like this:
## When to Use
[2-3 bullet points]

## Prerequisites
[tools/access needed]

## Workflow
[Step-by-step numbered workflow with bash commands in code blocks]

## Key Concepts
[3-5 key terms and definitions]

## Common Pitfalls
[2-3 pitfalls to avoid]

Be highly specific, use real tool names, real commands, and practitioner-level detail. This is from the Anthropic-Cybersecurity-Skills library standard.`,
      messages: [{ role: "user", content: `Generate the full skill playbook for: ${label}` }],
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.content.filter(b => b.type === "text").map(b => b.text).join("");
}

// ── Minimal markdown renderer ─────────────────────────────────────────────────
function MD({ text }) {
  const nodes = []; let k = 0; let inCode = false; let code = [];
  const flush = () => { if (!code.length) return; nodes.push(<pre key={k++} style={{ background: "#1e1e2e", color: "#cdd6f4", borderRadius: 6, padding: "10px 14px", fontSize: 11.5, overflowX: "auto", lineHeight: 1.55, fontFamily: "monospace", margin: "6px 0" }}><code>{code.join("\n")}</code></pre>); code = []; };
  for (const line of (text || "").split("\n")) {
    if (line.startsWith("```")) { if (inCode) { flush(); inCode = false; } else inCode = true; continue; }
    if (inCode) { code.push(line); continue; }
    if (/^#{1,3} /.test(line)) { const l = line.match(/^(#+)/)[1].length; nodes.push(<div key={k++} style={{ fontSize: l === 1 ? 15 : l === 2 ? 13.5 : 13, fontWeight: 500, color: "var(--color-text-primary)", margin: `${l < 3 ? 14 : 10}px 0 4px` }}>{line.replace(/^#+\s*/, "")}</div>); }
    else if (/^[*-] /.test(line)) nodes.push(<div key={k++} style={{ fontSize: 12.5, lineHeight: 1.6, color: "var(--color-text-primary)", paddingLeft: 10, marginBottom: 2 }}>• {line.slice(2)}</div>);
    else if (line.trim() === "") nodes.push(<div key={k++} style={{ height: 5 }} />);
    else { const parts = line.split(/(`[^`]+`)/g); nodes.push(<p key={k++} style={{ fontSize: 12.5, lineHeight: 1.65, color: "var(--color-text-primary)", margin: "2px 0" }}>{parts.map((p, i) => p.startsWith("`") && p.endsWith("`") && p.length > 2 ? <code key={i} style={{ fontFamily: "monospace", fontSize: 11.5, background: "var(--color-background-secondary)", padding: "1px 5px", borderRadius: 3 }}>{p.slice(1, -1)}</code> : p)}</p>); }
  }
  flush();
  return <>{nodes}</>;
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [search, setSearch] = useState("");
  const [filterDomain, setFilterDomain] = useState("All");
  const [activeSkill, setActiveSkill] = useState(null);
  const [skillContent, setSkillContent] = useState(null);
  const [skillLoading, setSkillLoading] = useState(false);
  const [panel, setPanel] = useState("chat");
  const [sidebar, setSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loadedSkill, setLoadedSkill] = useState(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const domains = ["All", ...Array.from(new Set(SKILLS.map(s => s.d)))];

  const filtered = SKILLS.filter(s => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.name.includes(q) || s.d.toLowerCase().includes(q);
    const matchDomain = filterDomain === "All" || s.d === filterDomain;
    return matchSearch && matchDomain;
  });

  const handlePickSkill = useCallback(async (skill) => {
    setActiveSkill(skill);
    setSkillContent(null);
    setSkillLoading(true);
    setPanel("skill");
    try {
      const content = await loadSkillViaAI(skill.name);
      setSkillContent(content);
    } catch (e) {
      setSkillContent(`Error loading skill: ${e.message}`);
    } finally {
      setSkillLoading(false);
    }
  }, []);

  const handleLoadToChat = () => {
    if (!skillContent || !activeSkill) return;
    setLoadedSkill({ name: activeSkill.name, content: skillContent });
    setPanel("chat");
    setMessages(prev => [...prev, { role: "note", text: `Skill loaded: ${activeSkill.name.replace(/-/g, " ")}` }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    const userMsg = { role: "user", content: text };
    const newHistory = [...history, userMsg];
    setMessages(prev => [...prev, { role: "user", text }]);
    setHistory(newHistory);
    setThinking(true);
    try {
      const reply = await callClaude(newHistory, loadedSkill?.content || null);
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
      setHistory(prev => [...prev, { role: "assistant", content: reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", text: `Error: ${e.message}` }]);
    } finally {
      setThinking(false);
      setTimeout(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); inputRef.current?.focus(); }, 50);
    }
  };

  const clearAll = () => { setMessages([]); setHistory([]); setLoadedSkill(null); setActiveSkill(null); setSkillContent(null); };

  const QUICK = [
    "Analyze a memory dump for credential theft using Volatility3",
    "Write a Sigma rule to detect Kerberoasting in Windows event logs",
    "Audit my Kubernetes RBAC — what are the top checks?",
    "How do I scope a multi-cloud breach across AWS, Azure, and GCP?",
  ];

  const dc = activeSkill ? (DOMAIN_COLORS[activeSkill.d] || { bg: "var(--color-background-secondary)", fg: "var(--color-text-secondary)" }) : null;

  return (
    <div style={{ display: "flex", height: 700, fontFamily: "var(--font-sans)", background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      {sidebar && (
        <div style={{ width: 250, borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex", flexDirection: "column", flexShrink: 0 }}>
          <div style={{ padding: "12px 12px 8px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
              <i className="ti ti-shield-lock" style={{ fontSize: 16, color: "var(--color-text-info)" }} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>Skills Library</span>
              <span style={{ marginLeft: "auto", fontSize: 10, padding: "1px 7px", borderRadius: 10, background: "var(--color-background-secondary)", color: "var(--color-text-secondary)" }}>{SKILLS.length}</span>
            </div>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills…"
              style={{ width: "100%", boxSizing: "border-box", fontSize: 12, padding: "5px 9px", marginBottom: 6 }} />
            <select value={filterDomain} onChange={e => setFilterDomain(e.target.value)}
              style={{ width: "100%", fontSize: 11, padding: "4px 8px" }}>
              {domains.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.map(skill => {
              const c = DOMAIN_COLORS[skill.d] || { bg: "var(--color-background-secondary)", fg: "var(--color-text-secondary)" };
              const active = activeSkill?.name === skill.name;
              return (
                <button key={skill.name} onClick={() => handlePickSkill(skill)} style={{
                  display: "block", width: "100%", textAlign: "left", padding: "7px 12px",
                  background: active ? "var(--color-background-secondary)" : "transparent",
                  border: "none", borderBottom: "0.5px solid var(--color-border-tertiary)", cursor: "pointer",
                }}>
                  <div style={{ fontSize: 12, fontWeight: active ? 500 : 400, color: "var(--color-text-primary)", lineHeight: 1.4, marginBottom: 3 }}>
                    {skill.name.replace(/-/g, " ")}
                  </div>
                  <span style={{ fontSize: 9.5, padding: "1px 6px", borderRadius: 8, background: c.bg, color: c.fg }}>{skill.d}</span>
                </button>
              );
            })}
            {filtered.length === 0 && <div style={{ padding: 14, fontSize: 12, color: "var(--color-text-secondary)" }}>No skills match</div>}
          </div>
        </div>
      )}

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "0.5px solid var(--color-border-tertiary)", flexShrink: 0 }}>
          <button onClick={() => setSidebar(v => !v)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--color-text-secondary)", padding: 4 }}>
            <i className="ti ti-layout-sidebar" style={{ fontSize: 18 }} />
          </button>
          {["chat", "skill"].map(t => (
            <button key={t} onClick={() => setPanel(t)} style={{
              fontSize: 12, padding: "4px 12px", borderRadius: "var(--border-radius-md)", cursor: "pointer",
              border: "0.5px solid", borderColor: panel === t ? "var(--color-border-primary)" : "var(--color-border-tertiary)",
              background: panel === t ? "var(--color-background-secondary)" : "transparent", color: "var(--color-text-primary)",
            }}>
              {t === "chat" ? "Chat" : "Skill Viewer"}
            </button>
          ))}
          {loadedSkill && (
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 10, background: "#e8f5e9", color: "#1b5e20", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <i className="ti ti-bolt" style={{ fontSize: 9, verticalAlign: -1, marginRight: 3 }} />{loadedSkill.name.replace(/-/g, " ")}
            </span>
          )}
          {panel === "skill" && activeSkill && skillContent && !skillLoading && (
            <button onClick={handleLoadToChat} style={{ marginLeft: "auto", fontSize: 12, padding: "4px 12px", cursor: "pointer" }}>
              <i className="ti ti-bolt" style={{ fontSize: 12, verticalAlign: -1 }} /> Use in chat
            </button>
          )}
          {panel === "chat" && messages.length > 0 && (
            <button onClick={clearAll} style={{ marginLeft: loadedSkill ? 4 : "auto", fontSize: 12, padding: "4px 10px", cursor: "pointer" }}>
              <i className="ti ti-trash" style={{ fontSize: 12, verticalAlign: -1 }} /> Clear
            </button>
          )}
        </div>

        {/* ── CHAT ── */}
        {panel === "chat" && (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.length === 0 && (
                <div style={{ margin: "auto", textAlign: "center", maxWidth: 380 }}>
                  <i className="ti ti-shield-check" style={{ fontSize: 44, color: "var(--color-text-tertiary)", display: "block", marginBottom: 14 }} />
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>Cybersecurity AI Agent</div>
                  <div style={{ fontSize: 12.5, color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: 16 }}>
                    Pick any skill from the left panel — Claude will generate its expert playbook and load it as context. Or ask anything directly.
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                    {QUICK.map(q => (
                      <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                        style={{ fontSize: 11, padding: "8px 10px", cursor: "pointer", textAlign: "left", lineHeight: 1.4, borderRadius: "var(--border-radius-md)" }}>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => {
                if (m.role === "note") return (
                  <div key={i} style={{ padding: "6px 12px", background: "#e8f5e9", borderRadius: "var(--border-radius-md)", fontSize: 12, color: "#1b5e20", display: "flex", gap: 7, alignItems: "center" }}>
                    <i className="ti ti-bolt" />{m.text}
                  </div>
                );
                const isUser = m.role === "user";
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", flexDirection: isUser ? "row-reverse" : "row" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isUser ? "var(--color-background-info)" : "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                      <i className={`ti ${isUser ? "ti-user" : "ti-shield-lock"}`} style={{ fontSize: 14, color: isUser ? "var(--color-text-info)" : "var(--color-text-secondary)" }} />
                    </div>
                    <div style={{ maxWidth: "80%", padding: "10px 14px", background: isUser ? "var(--color-background-info)" : "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)" }}>
                      {isUser ? <p style={{ fontSize: 13, lineHeight: 1.6, margin: 0 }}>{m.text}</p> : <MD text={m.text} />}
                    </div>
                  </div>
                );
              })}
              {thinking && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)" }}>
                    <i className="ti ti-shield-lock" style={{ fontSize: 14, color: "var(--color-text-secondary)" }} />
                  </div>
                  <div style={{ padding: "10px 14px", background: "var(--color-background-secondary)", borderRadius: "var(--border-radius-lg)", border: "0.5px solid var(--color-border-tertiary)", fontSize: 13, color: "var(--color-text-secondary)" }}>
                    Analyzing{loadedSkill ? " with skill context" : ""}…
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "10px 14px", display: "flex", gap: 8, alignItems: "flex-end" }}>
              {loadedSkill && (
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, background: "#e8f5e9", color: "#1b5e20", flexShrink: 0, alignSelf: "center" }}>
                  <i className="ti ti-bolt" style={{ fontSize: 9, verticalAlign: -1 }} /> {loadedSkill.name.replace(/-/g, " ").slice(0, 22)}…
                </span>
              )}
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Ask a security question… (Enter to send)" rows={2}
                style={{ flex: 1, resize: "none", fontSize: 13, fontFamily: "var(--font-sans)", padding: "8px 12px", borderRadius: "var(--border-radius-md)", border: "0.5px solid var(--color-border-secondary)" }} />
              <button onClick={handleSend} disabled={thinking || !input.trim()} style={{ padding: "9px 16px", cursor: thinking || !input.trim() ? "not-allowed" : "pointer", opacity: thinking || !input.trim() ? 0.45 : 1, alignSelf: "flex-end" }}>
                <i className="ti ti-send" style={{ fontSize: 15, verticalAlign: -2 }} />
              </button>
            </div>
          </>
        )}

        {/* ── SKILL VIEWER ── */}
        {panel === "skill" && (
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
            {!activeSkill && (
              <div style={{ textAlign: "center", paddingTop: 80, color: "var(--color-text-secondary)" }}>
                <i className="ti ti-books" style={{ fontSize: 40, display: "block", marginBottom: 12 }} />
                <div style={{ fontSize: 13 }}>Select a skill from the left panel to generate its expert playbook</div>
              </div>
            )}
            {activeSkill && skillLoading && (
              <div style={{ textAlign: "center", paddingTop: 80, color: "var(--color-text-secondary)" }}>
                <i className="ti ti-loader" style={{ fontSize: 30, display: "block", marginBottom: 10 }} />
                <div style={{ fontSize: 13 }}>Generating expert playbook for:</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)", marginTop: 4 }}>{activeSkill.name.replace(/-/g, " ")}</div>
              </div>
            )}
            {activeSkill && !skillLoading && skillContent && (
              <>
                <div style={{ background: "var(--color-background-secondary)", border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", padding: "14px 18px", marginBottom: 18 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 8 }}>{activeSkill.name.replace(/-/g, " ")}</div>
                  <span style={{ fontSize: 10.5, padding: "2px 9px", borderRadius: 10, background: dc?.bg, color: dc?.fg }}>{activeSkill.d}</span>
                  <div style={{ marginTop: 12, display: "flex", gap: 10, alignItems: "center" }}>
                    <button onClick={handleLoadToChat} style={{ fontSize: 12, padding: "5px 14px", cursor: "pointer" }}>
                      <i className="ti ti-bolt" style={{ fontSize: 12, verticalAlign: -1, marginRight: 4 }} />Load into chat
                    </button>
                    <a href={`https://github.com/mukul975/Anthropic-Cybersecurity-Skills/blob/main/skills/${activeSkill.name}/SKILL.md`}
                      target="_blank" rel="noreferrer" style={{ fontSize: 11.5, color: "var(--color-text-secondary)", textDecoration: "none" }}>
                      <i className="ti ti-external-link" style={{ fontSize: 11, verticalAlign: -1, marginRight: 3 }} />View on GitHub
                    </a>
                  </div>
                </div>
                <MD text={skillContent} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
