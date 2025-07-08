# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automated building and deployment.

## Workflows

### 1. Build and Publish (`build-and-publish.yml`)
**Triggers:**
- Push to `main` or `master` branch
- Pull requests to `main` or `master` branch  
- Manual dispatch

**Actions:**
- Installs dependencies and runs linting
- Builds single file package with `npm run build:single`
- Uploads build artifacts
- Deploys to GitHub Pages (main branch only)
- Runs Playwright tests
- Comments on PRs with build status

### 2. Release Build (`release.yml`)
**Triggers:**
- GitHub releases
- Manual dispatch with tag input

**Actions:**
- Builds single file package
- Creates release package with versioned filename
- Uploads release artifacts
- Attaches build to GitHub release

## Setup Requirements

### GitHub Pages
To enable GitHub Pages deployment:
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The workflow will automatically deploy builds from the main branch

### Repository Permissions
The workflows require these permissions:
- `contents: read` - Read repository contents
- `pages: write` - Deploy to GitHub Pages
- `id-token: write` - GitHub Pages deployment

### Secrets
No additional secrets are required. The workflows use:
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

## Build Artifacts

### Development Builds
- **Artifact Name:** `single-file-build`
- **Contents:** `dist/index.html` (single file package)
- **Retention:** 30 days

### Release Builds  
- **Artifact Name:** `release-package-{tag}`
- **Contents:** Versioned HTML file, README, release notes
- **Retention:** 90 days

## Usage

### Automatic Deployment
Push to main branch triggers automatic build and deployment to GitHub Pages.

### Manual Release
1. Create a GitHub release with a tag (e.g., `v1.0.0`)
2. The release workflow automatically builds and attaches the single file package
3. Users can download the complete application as a single HTML file

### Development Testing
Pull requests automatically trigger builds and tests, with status comments added to the PR.

## File Outputs

The single file build creates a complete standalone HTML application that includes:
- All JavaScript bundled inline
- All CSS bundled inline  
- No external dependencies
- Ready to run in any modern browser
- Typical size: ~700KB gzipped

## Monitoring

Check the Actions tab in the GitHub repository to monitor workflow runs and download artifacts.