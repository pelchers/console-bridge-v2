# GitHub Actions Test Repository

A comprehensive testing repository for GitHub Actions workflows with cross-platform support for Claude Desktop, Claude Code, GitHub Mobile, and more.

## 🎯 Purpose

This repository demonstrates and tests:
- **Automated workflows** that run on schedule (unattended for hours)
- **Manual trigger workflows** for incremental tasks and fixes
- **Validation workflows** for code quality and structure checks
- **Cross-platform access** from desktop, mobile, web, and CLI

## 📁 Repository Structure

```
github-actions-test1/
├── .github/
│   └── workflows/
│       ├── automated-test.yml    # Runs every 3 hours automatically
│       ├── manual-task.yml       # Manual trigger for incremental work
│       └── validate.yml          # Validation and quality checks
│
├── .claude/                      # Development conventions and workflows
│   ├── claude.md                 # Navigation and file index
│   ├── adr/                      # Architecture Decision Records
│   ├── workflows/
│   │   ├── conventions/          # Development conventions
│   │   └── development/          # Development tracking
│
├── README.md                     # This file
└── TESTING.md                    # Comprehensive testing guide
```

## 🚀 Getting Started

### 1. Clone or Fork This Repository

```bash
git clone https://github.com/YOUR_USERNAME/github-actions-test1.git
cd github-actions-test1
```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: GitHub Actions test repository"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/github-actions-test1.git
git push -u origin main
```

### 3. Enable GitHub Actions

- Go to your repository on GitHub
- Click on "Actions" tab
- GitHub Actions should be automatically enabled
- Workflows will appear once pushed

## 🔧 Available Workflows

### 1. Automated Test Workflow
**File:** `.github/workflows/automated-test.yml`

- **Trigger:** Runs every 3 hours automatically
- **Manual Trigger:** Yes, via workflow_dispatch
- **Purpose:** Demonstrates automated, unattended workflow execution
- **Artifacts:** Creates test results artifact

**How to run manually:**
1. Go to Actions tab on GitHub
2. Select "Automated Test Workflow"
3. Click "Run workflow"
4. Enter optional custom message
5. Click "Run workflow" button

### 2. Manual Task Workflow
**File:** `.github/workflows/manual-task.yml`

- **Trigger:** Manual only (workflow_dispatch)
- **Purpose:** Execute incremental tasks and fixes
- **Task Types:** test, build, lint, format, custom
- **Artifacts:** Creates task results artifact

**How to run:**
1. Go to Actions tab on GitHub
2. Select "Manual Task Workflow"
3. Click "Run workflow"
4. Choose task type from dropdown
5. Enter task description
6. Optionally specify files to process
7. Enable verbose output if needed
8. Click "Run workflow" button

### 3. Validation Workflow
**File:** `.github/workflows/validate.yml`

- **Trigger:** Automatic on push/PR to main/develop
- **Manual Trigger:** Yes, with validation level options
- **Purpose:** Validate repository structure and code quality
- **Validation Levels:** quick, standard, comprehensive
- **Artifacts:** Creates validation report

## 📱 Cross-Platform Access

### GitHub Web
1. Navigate to your repository
2. Click "Actions" tab
3. Select workflow
4. Click "Run workflow" button

### GitHub Mobile App
1. Open GitHub app
2. Navigate to repository
3. Tap "Actions"
4. Select workflow
5. Tap "Run workflow"

### Claude Desktop App
*(Integration instructions in TESTING.md)*

### Claude Code CLI
```bash
gh workflow run automated-test.yml
gh workflow run manual-task.yml -f task_type=test
gh workflow run validate.yml -f validation_level=standard
```

### Claude Mobile App
*(Integration instructions in TESTING.md)*

## 📊 Monitoring Workflows

### View Running Workflows
- **Web:** Actions tab → Click on workflow run
- **Mobile:** Actions → Tap workflow run
- **CLI:** `gh run list` and `gh run view <run-id>`

### Download Artifacts
- **Web:** Workflow run page → Artifacts section → Download
- **CLI:** `gh run download <run-id>`

## 🧪 Testing

See **[TESTING.md](TESTING.md)** for comprehensive testing instructions including:
- How to test each workflow
- Platform-specific testing procedures
- Verification steps
- Troubleshooting

## 📚 Additional Documentation

- **[TESTING.md](TESTING.md)** - Complete testing guide
- **[.claude/claude.md](.claude/claude.md)** - Development conventions
- **Guides:** See `C:\Claude\guides\Github-Actions\` for platform-specific guides

## 🔐 Security Notes

- This is a test repository with sample workflows
- No sensitive data or secrets should be stored here
- GitHub Actions secrets can be added via repository Settings → Secrets
- Never commit API keys or credentials

## 📝 License

This is a test repository. Modify and use as needed for learning GitHub Actions.

## 🤝 Contributing

This is a personal test repository. Feel free to fork and experiment!

## 📞 Support

For GitHub Actions documentation:
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

---

**Last Updated:** October 3, 2025  
**Status:** Active Testing Repository
