import { useState, useRef, useCallback, useEffect } from "react";

// ── Skill index — baked in, no network needed ─────────────────────────────────
const SKILLS = [
  { name: "acquiring-disk-image-with-dd-and-dcfldd", d: "DFIR" },
  { name: "performing-memory-forensics-with-volatility3", d: "DFIR" },
  { name: "analyzing-memory-with-winpmem-and-rekall", d: "DFIR" },
  { name: "building-incident-response-playbook", d: "DFIR" },
  { name: "performing-network-forensics-with-wireshark", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-lateral-movement", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-credential-access", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-privilege-escalation", d: "DFIR" },
  { name: "analyzing-windows-event-logs-for-persistence", d: "DFIR" },
  { name: "performing-email-header-analysis-for-phishing", d: "DFIR" },
  { name: "performing-triage-with-velociraptor", d: "DFIR" },
  { name: "performing-log-correlation-with-splunk", d: "DFIR" },
  { name: "performing-ransomware-incident-response", d: "DFIR" },
  { name: "performing-business-email-compromise-investigation", d: "DFIR" },
  { name: "performing-cloud-forensics-for-aws", d: "DFIR" },
  { name: "performing-cloud-forensics-for-azure", d: "DFIR" },
  { name: "performing-cloud-forensics-for-gcp", d: "DFIR" },
  { name: "hunting-for-credential-dumping-lsass", d: "Threat Hunting" },
  { name: "hunting-for-command-and-control-beaconing", d: "Threat Hunting" },
  { name: "hunting-for-living-off-the-land-binaries", d: "Threat Hunting" },
  { name: "hunting-for-lateral-movement-with-wmi", d: "Threat Hunting" },
  { name: "hunting-for-kerberoasting-attacks", d: "Threat Hunting" },
  { name: "hunting-for-as-rep-roasting", d: "Threat Hunting" },
  { name: "hunting-for-dcsync-attacks", d: "Threat Hunting" },
  { name: "hunting-for-pass-the-hash-attacks", d: "Threat Hunting" },
  { name: "hunting-for-golden-ticket-attacks", d: "Threat Hunting" },
  { name: "hunting-for-powershell-obfuscation", d: "Threat Hunting" },
  { name: "hunting-for-dns-tunneling", d: "Threat Hunting" },
  { name: "hunting-for-web-shell-activity", d: "Threat Hunting" },
  { name: "hunting-for-ransomware-precursors", d: "Threat Hunting" },
  { name: "hunting-for-aws-credential-theft", d: "Threat Hunting" },
  { name: "hunting-for-cobalt-strike-indicators", d: "Threat Hunting" },
  { name: "hunting-for-mimikatz-artifacts", d: "Threat Hunting" },
  { name: "hunting-with-yara-rules", d: "Threat Hunting" },
  { name: "hunting-with-sigma-rules", d: "Threat Hunting" },
  { name: "writing-sigma-rules-for-detection", d: "Threat Hunting" },
  { name: "performing-cloud-security-posture-assessment", d: "Cloud Security" },
  { name: "implementing-cloud-security-monitoring", d: "Cloud Security" },
  { name: "auditing-aws-iam-policies-for-least-privilege", d: "Cloud Security" },
  { name: "auditing-azure-rbac-for-excessive-permissions", d: "Cloud Security" },
  { name: "auditing-gcp-iam-for-overprivileged-accounts", d: "Cloud Security" },
  { name: "implementing-aws-security-hub-automation", d: "Cloud Security" },
  { name: "implementing-aws-guardduty-for-threat-detection", d: "Cloud Security" },
  { name: "implementing-aws-cloudtrail-for-audit-logging", d: "Cloud Security" },
  { name: "securing-aws-s3-buckets-for-data-protection", d: "Cloud Security" },
  { name: "securing-azure-storage-accounts", d: "Cloud Security" },
  { name: "securing-gke-clusters", d: "Cloud Security" },
  { name: "securing-aws-eks-clusters", d: "Cloud Security" },
  { name: "securing-azure-aks-clusters", d: "Cloud Security" },
  { name: "implementing-secrets-management-with-hashicorp-vault", d: "Cloud Security" },
  { name: "implementing-aws-secrets-manager", d: "Cloud Security" },
  { name: "implementing-azure-key-vault-policies", d: "Cloud Security" },
  { name: "performing-aws-penetration-testing", d: "Cloud Security" },
  { name: "performing-azure-penetration-testing", d: "Cloud Security" },
  { name: "performing-gcp-penetration-testing", d: "Cloud Security" },
  { name: "implementing-cspm-with-prisma-cloud", d: "Cloud Security" },
  { name: "performing-kubernetes-penetration-testing", d: "Container Security" },
  { name: "auditing-kubernetes-rbac-configurations", d: "Container Security" },
  { name: "implementing-kubernetes-network-policies", d: "Container Security" },
  { name: "scanning-container-images-with-trivy", d: "Container Security" },
  { name: "implementing-pod-security-standards", d: "Container Security" },
  { name: "securing-kubernetes-api-server", d: "Container Security" },
  { name: "implementing-runtime-security-with-falco", d: "Container Security" },
  { name: "hardening-docker-daemon-configuration", d: "Container Security" },
  { name: "implementing-opa-gatekeeper-for-policy-enforcement", d: "Container Security" },
  { name: "performing-container-escape-detection", d: "Container Security" },
  { name: "auditing-helm-chart-security", d: "Container Security" },
  { name: "implementing-service-mesh-security-with-istio", d: "Container Security" },
  { name: "implementing-github-advanced-security-for-code-scanning", d: "DevSecOps" },
  { name: "implementing-sast-with-semgrep", d: "DevSecOps" },
  { name: "implementing-dast-with-owasp-zap", d: "DevSecOps" },
  { name: "implementing-sca-with-dependency-check", d: "DevSecOps" },
  { name: "implementing-secret-scanning-in-ci-cd", d: "DevSecOps" },
  { name: "implementing-iac-security-scanning-with-checkov", d: "DevSecOps" },
  { name: "implementing-sbom-generation-and-management", d: "DevSecOps" },
  { name: "securing-jenkins-pipelines", d: "DevSecOps" },
  { name: "securing-github-actions-workflows", d: "DevSecOps" },
  { name: "performing-secure-code-review", d: "DevSecOps" },
  { name: "implementing-security-gates-in-ci-cd", d: "DevSecOps" },
  { name: "performing-threat-modeling-with-stride", d: "DevSecOps" },
  { name: "performing-external-network-penetration-testing", d: "Pen Testing" },
  { name: "performing-internal-network-penetration-testing", d: "Pen Testing" },
  { name: "performing-web-application-penetration-testing", d: "Pen Testing" },
  { name: "performing-active-directory-penetration-testing", d: "Pen Testing" },
  { name: "performing-api-penetration-testing", d: "Pen Testing" },
  { name: "performing-red-team-operation-planning", d: "Pen Testing" },
  { name: "performing-assumed-breach-assessment", d: "Pen Testing" },
  { name: "using-metasploit-for-exploitation", d: "Pen Testing" },
  { name: "performing-privilege-escalation-on-linux", d: "Pen Testing" },
  { name: "performing-privilege-escalation-on-windows", d: "Pen Testing" },
  { name: "performing-password-spraying-attacks", d: "Pen Testing" },
  { name: "performing-subdomain-enumeration-and-recon", d: "Pen Testing" },
  { name: "writing-penetration-testing-report", d: "Pen Testing" },
  { name: "analyzing-active-directory-acl-abuse", d: "Identity Security" },
  { name: "implementing-privileged-access-workstation", d: "Identity Security" },
  { name: "implementing-tiered-admin-model", d: "Identity Security" },
  { name: "auditing-active-directory-for-misconfigurations", d: "Identity Security" },
  { name: "implementing-laps-for-local-admin-passwords", d: "Identity Security" },
  { name: "implementing-pam-solution-for-privileged-access", d: "Identity Security" },
  { name: "implementing-zero-trust-identity-architecture", d: "Identity Security" },
  { name: "auditing-service-accounts-for-excessive-privileges", d: "Identity Security" },
  { name: "implementing-conditional-access-policies", d: "Identity Security" },
  { name: "analyzing-android-malware-with-apktool", d: "Malware Analysis" },
  { name: "performing-static-malware-analysis", d: "Malware Analysis" },
  { name: "performing-dynamic-malware-analysis-with-cuckoo", d: "Malware Analysis" },
  { name: "analyzing-malware-with-ghidra", d: "Malware Analysis" },
  { name: "analyzing-pdf-malware", d: "Malware Analysis" },
  { name: "analyzing-office-macro-malware", d: "Malware Analysis" },
  { name: "analyzing-ransomware-samples", d: "Malware Analysis" },
  { name: "analyzing-fileless-malware", d: "Malware Analysis" },
  { name: "writing-yara-rules-for-malware-detection", d: "Malware Analysis" },
  { name: "analyzing-api-gateway-access-logs", d: "Web Security" },
  { name: "performing-sql-injection-testing", d: "Web Security" },
  { name: "performing-xss-testing", d: "Web Security" },
  { name: "performing-ssrf-testing", d: "Web Security" },
  { name: "performing-jwt-security-testing", d: "Web Security" },
  { name: "performing-graphql-security-testing", d: "Web Security" },
  { name: "implementing-waf-rules-with-modsecurity", d: "Web Security" },
  { name: "performing-oauth-security-testing", d: "Web Security" },
  { name: "analyzing-ios-app-security-with-objection", d: "Mobile Security" },
  { name: "performing-android-penetration-testing", d: "Mobile Security" },
  { name: "performing-ios-penetration-testing", d: "Mobile Security" },
  { name: "evaluating-threat-intelligence-platforms", d: "Threat Intel" },
  { name: "performing-mitre-attack-threat-mapping", d: "Threat Intel" },
  { name: "analyzing-threat-actor-ttps", d: "Threat Intel" },
  { name: "building-indicator-of-compromise-feeds", d: "Threat Intel" },
  { name: "performing-dark-web-monitoring", d: "Threat Intel" },
  { name: "performing-vulnerability-scanning-with-nessus", d: "Vuln Mgmt" },
  { name: "implementing-vulnerability-management-program", d: "Vuln Mgmt" },
  { name: "prioritizing-vulnerabilities-with-cvss-and-epss", d: "Vuln Mgmt" },
  { name: "tracking-vulnerabilities-with-jira", d: "Vuln Mgmt" },
  { name: "performing-attack-surface-management", d: "Vuln Mgmt" },
  { name: "implementing-ids-ips-with-suricata", d: "Network Security" },
  { name: "implementing-zeek-for-network-monitoring", d: "Network Security" },
  { name: "performing-firewall-rule-audit", d: "Network Security" },
  { name: "performing-dns-security-assessment", d: "Network Security" },
  { name: "implementing-pci-dss-controls", d: "Compliance" },
  { name: "implementing-soc2-controls", d: "Compliance" },
  { name: "implementing-iso27001-controls", d: "Compliance" },
  { name: "implementing-nist-csf-2-controls", d: "Compliance" },
  { name: "performing-gdpr-data-protection-assessment", d: "Compliance" },
  { name: "performing-hipaa-security-risk-assessment", d: "Compliance" },
  { name: "performing-third-party-risk-assessment", d: "Compliance" },
  { name: "detecting-prompt-injection-attacks", d: "AI Security" },
  { name: "implementing-llm-security-guardrails", d: "AI Security" },
  { name: "performing-ml-pipeline-security-review", d: "AI Security" },
  { name: "analyzing-ai-agent-attack-vectors", d: "AI Security" },
  { name: "implementing-nist-ai-rmf-controls", d: "AI Security" },
  { name: "performing-ot-network-security-assessment", d: "OT/ICS" },
  { name: "implementing-ics-network-segmentation", d: "OT/ICS" },
  { name: "performing-scada-vulnerability-assessment", d: "OT/ICS" },
];

const DC = {
  "DFIR":              { bg:"#fff3e0", fg:"#e65100" },
  "Threat Hunting":    { bg:"#fce4ec", fg:"#880e4f" },
  "Cloud Security":    { bg:"#e3f2fd", fg:"#0d47a1" },
  "Container Security":{ bg:"#e8f5e9", fg:"#1b5e20" },
  "DevSecOps":         { bg:"#f3e5f5", fg:"#4a148c" },
  "Pen Testing":       { bg:"#ffebee", fg:"#b71c1c" },
  "Identity Security": { bg:"#e8eaf6", fg:"#1a237e" },
  "Malware Analysis":  { bg:"#fbe9e7", fg:"#bf360c" },
  "Web Security":      { bg:"#e0f7fa", fg:"#006064" },
  "Mobile Security":   { bg:"#f9fbe7", fg:"#558b2f" },
  "Threat Intel":      { bg:"#ede7f6", fg:"#311b92" },
  "Vuln Mgmt":         { bg:"#fff8e1", fg:"#f57f17" },
  "Network Security":  { bg:"#e0f2f1", fg:"#004d40" },
  "Compliance":        { bg:"#f1f8e9", fg:"#33691e" },
  "AI Security":       { bg:"#e8eaf6", fg:"#283593" },
  "OT/ICS":            { bg:"#efebe9", fg:"#3e2723" },
};

// ── How this works ────────────────────────────────────────────────────────────
// The agent uses sendPrompt() — the built-in claude.ai bridge — to communicate
// with Claude. This uses your claude.ai subscription (Pro/Max/Team), NOT the
// paid API. No API key, no credits consumed.
//
// Flow:
//   User action → sendPrompt(text) → Claude responds in main chat → 
//   window message event fires → artifact reads the reply
//
// For skill playbooks: we send a structured prompt, Claude replies with the
// playbook, and we capture it. For chat: same pattern, multi-turn via prompts.
// ─────────────────────────────────────────────────────────────────────────────

function MD({ text }) {
  const nodes = []; let k = 0; let inCode = false; let code = [];
  const flush = () => {
    if (!code.length) return;
    nodes.push(<pre key={k++} style={{background:"#1a1b26",color:"#a9b1d6",borderRadius:7,padding:"11px 14px",fontSize:11.5,overflowX:"auto",lineHeight:1.6,fontFamily:"monospace",margin:"7px 0",border:"0.5px solid #2a2b3d"}}><code>{code.join("\n")}</code></pre>);
    code=[];
  };
  for (const line of (text||"").split("\n")) {
    if (line.startsWith("```")) { if(inCode){flush();inCode=false;}else inCode=true; continue; }
    if (inCode) { code.push(line); continue; }
    if (/^\|/.test(line)&&line.endsWith("|")) {
      if(line.includes("---")) continue;
      const cells=line.split("|").slice(1,-1).map(c=>c.trim());
      nodes.push(<div key={k++} style={{display:"flex",fontSize:12,borderBottom:"0.5px solid var(--color-border-tertiary)"}}>{cells.map((c,i)=><div key={i} style={{flex:1,padding:"4px 8px",color:"var(--color-text-primary)",fontWeight:i===0?500:400}}>{c}</div>)}</div>);
    } else if (/^#{1,3} /.test(line)) {
      const l=line.match(/^(#+)/)[1].length;
      nodes.push(<div key={k++} style={{fontSize:l<2?15:l<3?13.5:13,fontWeight:500,color:"var(--color-text-primary)",margin:`${l<3?14:10}px 0 5px`,borderBottom:l<=2?"0.5px solid var(--color-border-tertiary)":"none",paddingBottom:l<=2?5:0}}>{line.replace(/^#+\s*/,"")}</div>);
    } else if (/^[*-] /.test(line)) {
      const parts=line.slice(2).split(/(\*\*[^*]+\*\*)/g);
      nodes.push(<div key={k++} style={{fontSize:12.5,lineHeight:1.65,color:"var(--color-text-primary)",paddingLeft:12,marginBottom:3,display:"flex",gap:6}}><span style={{flexShrink:0,color:"var(--color-text-secondary)"}}>•</span><span>{parts.map((p,i)=>p.startsWith("**")&&p.endsWith("**")?<strong key={i}>{p.slice(2,-2)}</strong>:p)}</span></div>);
    } else if (line.trim()==="") {
      nodes.push(<div key={k++} style={{height:6}}/>);
    } else {
      const parts=line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
      nodes.push(<p key={k++} style={{fontSize:12.5,lineHeight:1.7,color:"var(--color-text-primary)",margin:"2px 0"}}>{parts.map((p,i)=>{
        if(p.startsWith("`")&&p.endsWith("`")&&p.length>2) return <code key={i} style={{fontFamily:"monospace",fontSize:11.5,background:"var(--color-background-secondary)",padding:"1px 5px",borderRadius:3}}>{p.slice(1,-1)}</code>;
        if(p.startsWith("**")&&p.endsWith("**")) return <strong key={i}>{p.slice(2,-2)}</strong>;
        return p;
      })}</p>);
    }
  }
  flush();
  return <>{nodes}</>;
}

export default function App() {
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [activeSkill, setActiveSkill] = useState(null);
  const [skillContent, setSkillContent] = useState(null);
  const [skillLoading, setSkillLoading] = useState(false);
  const [panel, setPanel] = useState("chat");
  const [sidebar, setSidebar] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadedSkill, setLoadedSkill] = useState(null);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  // pending callback for sendPrompt responses
  const pendingRef = useRef(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // ── Listen for Claude's reply via window messages ─────────────────────────
  useEffect(() => {
    const handler = (event) => {
      const d = event.data;
      // claude.ai posts { type: "claude-response", content: "..." } or similar
      if (d && (d.type === "claude-response" || d.type === "prompt-response") && pendingRef.current) {
        const text = d.content || d.text || d.message || "";
        if (text && pendingRef.current) {
          pendingRef.current(text);
          pendingRef.current = null;
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  // ── Send a prompt and wait for reply via sendPrompt bridge ────────────────
  const ask = useCallback((promptText) => {
    return new Promise((resolve) => {
      pendingRef.current = resolve;
      if (typeof window.sendPrompt === "function") {
        window.sendPrompt(promptText);
      } else {
        // Fallback: post to parent frame
        window.parent?.postMessage({ type: "send-prompt", content: promptText }, "*");
        // If no bridge available, resolve with guidance after 8s
        setTimeout(() => {
          if (pendingRef.current) {
            pendingRef.current = null;
            resolve("__no_bridge__");
          }
        }, 8000);
      }
    });
  }, []);

  const domains = ["All", ...Array.from(new Set(SKILLS.map(s => s.d)))];
  const filtered = SKILLS.filter(s => {
    const q = search.toLowerCase();
    return (!search || s.name.includes(q) || s.d.toLowerCase().includes(q))
      && (domain === "All" || s.d === domain);
  });

  const pickSkill = useCallback(async (skill) => {
    setActiveSkill(skill);
    setSkillContent(null);
    setSkillLoading(true);
    setPanel("skill");

    const prompt = `[CYBERSEC-AGENT-SKILL-REQUEST]
Generate a detailed expert playbook for the cybersecurity skill: "${skill.name.replace(/-/g," )}"
Domain: ${skill.d}

Use EXACTLY this structure — be thorough and use real commands/tools:

## When to Use
- scenario 1
- scenario 2
- scenario 3

## Prerequisites
List exact tools, access requirements, install commands.

## Workflow

### Step 1: [Name]
Explanation.
\`\`\`bash
# real commands
\`\`\`

### Step 2: [Name]
[Continue all steps]

## Key Concepts
| Term | Definition |
|------|-----------|
| Term | Def |

## Common Pitfalls
- **Pitfall**: fix

No placeholder content. Real tool names, real CLI flags, real paths.`;

    const reply = await ask(prompt);

    if (reply === "__no_bridge__") {
      setSkillContent(`## ${skill.name.replace(/-/g," ")}\n\nThis agent uses the **sendPrompt bridge** built into claude.ai to generate playbooks.\n\nIt appears the bridge isn't available in this context. To use the Skill Viewer:\n\n1. Make sure you're viewing this artifact inside **claude.ai** (not a local file)\n2. Click **"Use in chat"** below and then ask your question directly in the chat tab — Claude will answer with expert knowledge of this skill.`);
    } else {
      setSkillContent(reply);
    }
    setSkillLoading(false);
  }, [ask]);

  const loadToChat = () => {
    if (!activeSkill) return;
    setLoadedSkill({ name: activeSkill.name, content: skillContent });
    setPanel("chat");
    setMessages(prev => [...prev, { role:"note", text:`Skill context active: ${activeSkill.name.replace(/-/g," ")}` }]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    setMessages(prev => [...prev, { role:"user", text }]);
    setThinking(true);

    // Build prompt — include skill context if loaded
    let prompt = text;
    if (loadedSkill?.content) {
      prompt = `[CYBERSEC-AGENT] You have this skill playbook as context:\n---\n${loadedSkill.content.slice(0,2000)}\n---\nUser question: ${text}\n\nAnswer as an expert practitioner using the skill context above.`;
    } else {
      prompt = `[CYBERSEC-AGENT] As an expert cybersecurity engineer, answer this precisely and with real commands/tools:\n\n${text}`;
    }

    const reply = await ask(prompt);

    if (reply === "__no_bridge__") {
      setMessages(prev => [...prev, { role:"assistant", text:"⚠️ The sendPrompt bridge isn't responding. Make sure you're using this artifact inside claude.ai and try refreshing." }]);
    } else {
      setMessages(prev => [...prev, { role:"assistant", text: reply }]);
    }
    setThinking(false);
    setTimeout(() => { bottomRef.current?.scrollIntoView({behavior:"smooth"}); inputRef.current?.focus(); }, 50);
  };

  const clearAll = () => { setMessages([]); setLoadedSkill(null); };

  const QUICK = [
    "Analyze a memory dump for credential theft with Volatility3",
    "Write a Sigma rule to detect Kerberoasting",
    "Top Kubernetes RBAC misconfigs to check in production",
    "How do I scope a breach across AWS, Azure, and GCP?",
  ];

  const dc = activeSkill ? (DC[activeSkill.d] || {bg:"#eee",fg:"#333"}) : null;

  return (
    <div style={{display:"flex",height:700,fontFamily:"var(--font-sans)",background:"var(--color-background-primary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}>

      {/* SIDEBAR */}
      {sidebar && (
        <div style={{width:252,borderRight:"0.5px solid var(--color-border-tertiary)",display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{padding:"12px 12px 8px",borderBottom:"0.5px solid var(--color-border-tertiary)"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:9}}>
              <i className="ti ti-shield-lock" style={{fontSize:16,color:"var(--color-text-info)"}}/>
              <span style={{fontSize:13,fontWeight:500}}>Skills Library</span>
              <span style={{marginLeft:"auto",fontSize:10,padding:"1px 7px",borderRadius:10,background:"var(--color-background-secondary)",color:"var(--color-text-secondary)"}}>{SKILLS.length}</span>
            </div>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search skills…"
              style={{width:"100%",boxSizing:"border-box",fontSize:12,padding:"5px 9px",marginBottom:6}}/>
            <select value={domain} onChange={e=>setDomain(e.target.value)} style={{width:"100%",fontSize:11,padding:"4px 8px"}}>
              {domains.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{flex:1,overflowY:"auto"}}>
            {filtered.map(skill=>{
              const c=DC[skill.d]||{bg:"#eee",fg:"#555"};
              const active=activeSkill?.name===skill.name;
              return (
                <button key={skill.name} onClick={()=>pickSkill(skill)} style={{display:"block",width:"100%",textAlign:"left",padding:"7px 12px",background:active?"var(--color-background-secondary)":"transparent",border:"none",borderBottom:"0.5px solid var(--color-border-tertiary)",cursor:"pointer"}}>
                  <div style={{fontSize:11.5,fontWeight:active?500:400,color:"var(--color-text-primary)",lineHeight:1.4,marginBottom:3}}>{skill.name.replace(/-/g," ")}</div>
                  <span style={{fontSize:9.5,padding:"1px 6px",borderRadius:8,background:c.bg,color:c.fg}}>{skill.d}</span>
                </button>
              );
            })}
            {filtered.length===0&&<div style={{padding:14,fontSize:12,color:"var(--color-text-secondary)"}}>No skills match</div>}
          </div>
        </div>
      )}

      {/* MAIN */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>

        {/* Toolbar */}
        <div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",borderBottom:"0.5px solid var(--color-border-tertiary)",flexShrink:0}}>
          <button onClick={()=>setSidebar(v=>!v)} style={{background:"transparent",border:"none",cursor:"pointer",color:"var(--color-text-secondary)",padding:4}}>
            <i className="ti ti-layout-sidebar" style={{fontSize:18}}/>
          </button>
          {["chat","skill"].map(t=>(
            <button key={t} onClick={()=>setPanel(t)} style={{fontSize:12,padding:"4px 12px",borderRadius:"var(--border-radius-md)",cursor:"pointer",border:"0.5px solid",borderColor:panel===t?"var(--color-border-primary)":"var(--color-border-tertiary)",background:panel===t?"var(--color-background-secondary)":"transparent",color:"var(--color-text-primary)"}}>
              {t==="chat"?"Chat":"Skill Viewer"}
            </button>
          ))}
          {loadedSkill&&<span style={{fontSize:10,padding:"2px 8px",borderRadius:10,background:"#e8f5e9",color:"#1b5e20",maxWidth:180,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}><i className="ti ti-bolt" style={{fontSize:9,verticalAlign:-1,marginRight:3}}/>{loadedSkill.name.replace(/-/g," ")}</span>}
          {panel==="skill"&&activeSkill&&skillContent&&!skillLoading&&<button onClick={loadToChat} style={{marginLeft:"auto",fontSize:12,padding:"4px 12px",cursor:"pointer"}}><i className="ti ti-bolt" style={{fontSize:12,verticalAlign:-1}}/> Use in chat</button>}
          {panel==="chat"&&messages.length>0&&<button onClick={clearAll} style={{marginLeft:loadedSkill?4:"auto",fontSize:12,padding:"4px 10px",cursor:"pointer"}}><i className="ti ti-trash" style={{fontSize:12,verticalAlign:-1}}/> Clear</button>}
        </div>

        {/* CHAT */}
        {panel==="chat"&&(
          <>
            <div style={{flex:1,overflowY:"auto",padding:"16px 20px",display:"flex",flexDirection:"column",gap:12}}>
              {messages.length===0&&(
                <div style={{margin:"auto",textAlign:"center",maxWidth:380}}>
                  <i className="ti ti-shield-check" style={{fontSize:44,color:"var(--color-text-tertiary)",display:"block",marginBottom:14}}/>
                  <div style={{fontSize:15,fontWeight:500,color:"var(--color-text-primary)",marginBottom:6}}>Cybersecurity AI Agent</div>
                  <div style={{fontSize:12.5,color:"var(--color-text-secondary)",lineHeight:1.7,marginBottom:16}}>
                    Pick a skill from the left to generate its playbook, or ask any security question below.<br/>
                    <span style={{fontSize:11,color:"var(--color-text-tertiary)"}}>Uses your claude.ai session — no API credits needed.</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                    {QUICK.map(q=><button key={q} onClick={()=>{setInput(q);inputRef.current?.focus();}} style={{fontSize:11,padding:"8px 10px",cursor:"pointer",textAlign:"left",lineHeight:1.4,borderRadius:"var(--border-radius-md)"}}>{q}</button>)}
                  </div>
                </div>
              )}
              {messages.map((m,i)=>{
                if(m.role==="note") return <div key={i} style={{padding:"6px 12px",background:"#e8f5e9",borderRadius:"var(--border-radius-md)",fontSize:12,color:"#1b5e20",display:"flex",gap:7,alignItems:"center"}}><i className="ti ti-bolt"/>{m.text}</div>;
                const isUser=m.role==="user";
                return (
                  <div key={i} style={{display:"flex",gap:10,alignItems:"flex-start",flexDirection:isUser?"row-reverse":"row"}}>
                    <div style={{width:30,height:30,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:isUser?"var(--color-background-info)":"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)"}}>
                      <i className={`ti ${isUser?"ti-user":"ti-shield-lock"}`} style={{fontSize:14,color:isUser?"var(--color-text-info)":"var(--color-text-secondary)"}}/>
                    </div>
                    <div style={{maxWidth:"80%",padding:"10px 14px",background:isUser?"var(--color-background-info)":"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",border:"0.5px solid var(--color-border-tertiary)"}}>
                      {isUser?<p style={{fontSize:13,lineHeight:1.6,margin:0}}>{m.text}</p>:<MD text={m.text}/>}
                    </div>
                  </div>
                );
              })}
              {thinking&&(
                <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
                  <div style={{width:30,height:30,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)"}}>
                    <i className="ti ti-shield-lock" style={{fontSize:14,color:"var(--color-text-secondary)"}}/>
                  </div>
                  <div style={{padding:"10px 14px",background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-lg)",border:"0.5px solid var(--color-border-tertiary)",fontSize:13,color:"var(--color-text-secondary)"}}>
                    Analyzing{loadedSkill?" with skill context":""}…
                  </div>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>
            <div style={{borderTop:"0.5px solid var(--color-border-tertiary)",padding:"10px 14px",display:"flex",gap:8,alignItems:"flex-end"}}>
              {loadedSkill&&<span style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:"#e8f5e9",color:"#1b5e20",flexShrink:0,alignSelf:"center"}}><i className="ti ti-bolt" style={{fontSize:9,verticalAlign:-1}}/> {loadedSkill.name.replace(/-/g," ").slice(0,22)}…</span>}
              <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();}}}
                placeholder="Ask a security question… (Enter to send)" rows={2}
                style={{flex:1,resize:"none",fontSize:13,fontFamily:"var(--font-sans)",padding:"8px 12px",borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)"}}/>
              <button onClick={sendMessage} disabled={thinking||!input.trim()} style={{padding:"9px 16px",cursor:thinking||!input.trim()?"not-allowed":"pointer",opacity:thinking||!input.trim()?0.45:1,alignSelf:"flex-end"}}>
                <i className="ti ti-send" style={{fontSize:15,verticalAlign:-2}}/>
              </button>
            </div>
          </>
        )}

        {/* SKILL VIEWER */}
        {panel==="skill"&&(
          <div style={{flex:1,overflowY:"auto",padding:"18px 22px"}}>
            {!activeSkill&&<div style={{textAlign:"center",paddingTop:80,color:"var(--color-text-secondary)"}}><i className="ti ti-books" style={{fontSize:40,display:"block",marginBottom:12}}/><div style={{fontSize:13}}>Select a skill from the left panel</div></div>}
            {activeSkill&&skillLoading&&(
              <div style={{textAlign:"center",paddingTop:80,color:"var(--color-text-secondary)"}}>
                <i className="ti ti-loader" style={{fontSize:30,display:"block",marginBottom:10}}/>
                <div style={{fontSize:13}}>Generating expert playbook for:</div>
                <div style={{fontSize:13,fontWeight:500,color:"var(--color-text-primary)",marginTop:4}}>{activeSkill.name.replace(/-/g," ")}</div>
              </div>
            )}
            {activeSkill&&!skillLoading&&skillContent&&(
              <>
                <div style={{background:"var(--color-background-secondary)",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",padding:"14px 18px",marginBottom:18}}>
                  <div style={{fontSize:15,fontWeight:500,color:"var(--color-text-primary)",marginBottom:8}}>{activeSkill.name.replace(/-/g," ")}</div>
                  <span style={{fontSize:10.5,padding:"2px 9px",borderRadius:10,background:dc?.bg,color:dc?.fg}}>{activeSkill.d}</span>
                  <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}>
                    <button onClick={loadToChat} style={{fontSize:12,padding:"5px 14px",cursor:"pointer"}}>
                      <i className="ti ti-bolt" style={{fontSize:12,verticalAlign:-1,marginRight:4}}/>Load into chat
                    </button>
                    <a href={`https://github.com/mukul975/Anthropic-Cybersecurity-Skills/blob/main/skills/${activeSkill.name}/SKILL.md`}
                      target="_blank" rel="noreferrer" style={{fontSize:11.5,color:"var(--color-text-secondary)",textDecoration:"none"}}>
                      <i className="ti ti-external-link" style={{fontSize:11,verticalAlign:-1,marginRight:3}}/>View on GitHub
                    </a>
                  </div>
                </div>
                <MD text={skillContent}/>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
