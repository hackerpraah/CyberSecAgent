# CyberSecAgent

The agent has two panels:

Left — Skill Browser: Calls the GitHub Tree API at startup to dynamically fetch all 754 skill slugs from mukul975/Anthropic-Cybersecurity-Skills. You can search and click any skill to load it.
Right — Chat + Skill Viewer: Two tabs — one for the AI chat, one to read the full SKILL.md playbook before loading it.

How skills work
When you select a skill and click "Load into chat context", the full SKILL.md content (YAML frontmatter + workflow steps + commands + key concepts) is injected as the system prompt for Claude. This means the agent answers as if it's a practitioner who's already loaded that playbook — it knows the exact tools, commands, prerequisites, and pitfalls for that skill.
Flow

Search skills (e.g. "kerberoast", "kubernetes", "cloud", "forensics")
Click a skill → read its full workflow in the Skill Viewer tab
Hit "Load into chat context" → switch to Chat
Ask your question — Claude responds with that skill's expert context baked in
Or skip skill selection entirely for general security chat

Note on the GitHub API: The index fetch uses the public GitHub API (no auth needed), but it's rate-limited to 60 req/hour per IP. If you hit the limit, it'll show an error — just wait a minute. For production use, add a GITHUB_TOKEN header to the fetch call
