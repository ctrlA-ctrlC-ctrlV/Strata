# Phase 0 Research: Static Marketing Site & Configurator

## Decisions

### D1. Node.js Version
- Decision: Node.js (latest stable release)
- Rationale: Current LTS, strong ecosystem support, security updates
- Alternatives: 18 LTS (older), 22 (non‑LTS or early LTS)

### D2. Validation Library
- Decision: zod
- Rationale: Great DX, schema‑first validation, type inference
- Alternatives: joi (mature, widely used), yup (browser‑oriented)

### D3. Email Provider
- Decision: SMTP
- Rationale: cost‑effective
- Alternatives: Postmark (variable deliverability)

### D4. MongoDB Security
- Decision: Use MongoDB latest stable release, TLS required, SCRAM auth, principle of least privilege roles; DO firewall IP allowlist (API host + CI IPs); backups enabled with daily schedule and PITR where available
- Rationale: Data security priority; resilience against exfiltration
- Alternatives: Self‑hosted backups only (higher risk), open network access (unacceptable)

### D5. Pricing Reveal Strategy
- Decision: Inline estimate + gated breakdown
- Rationale: Balances trust (visible estimate) with lead capture (breakdown detail after short form)
- Alternatives: Gated only

### D6. Payments in MVP
- Decision: Quote‑only
- Rationale: Reduce complexity and compliance in MVP; focus on lead gen
- Alternatives: Deposits at checkout; soft reservation

### D7. Geography Scope
- Decision: Radius‑based
- Rationale: <100Km is manageble and doesn't eat away profitability. Any further require approval
- Alternatives: Nationwide

