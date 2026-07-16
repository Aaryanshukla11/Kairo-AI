# Release Policy

This document defines the packaging, offline installations, versioning, development, and hotfix release policies for AIIdle.

---

## 1. Versioning System
- System follows Semantic Versioning 2.0.0 (`MAJOR.MINOR.PATCH`).
- Pre-releases are tagged with `-draft` (e.g. `0.5.0-draft`).
- Bump minor versions on feature additions, and patch versions on bug fixes.

---

## 2. Build & Packaging Pipelines

### 2.1. Development Build
- Vite builds the frontend React Webview assets with source-maps.
- esbuild compiles extension backend controllers instantly on save files loops.

### 2.2. Production Build
- Mini-pack assets and prune devDependencies.
- Compile and bundle into a single, clean `.vsix` extension package.

### 2.3. Offline Installer Package
- Bundles all package dependencies (including the local LLM wrapper runtime, embedding models, and Ripgrep libraries) into the release container.
- Verification checks: Post-installation, disconnect network interfaces, trigger startup, and run basic mock prompts.

---

## 3. Hotfix Release Cycle
- Emergency bug fixes must branch off the current release branch.
- Run regression tests.
- Re-tag and package as a patch version release.
- Update `KNOWN_ISSUES.md` states to reflect resolutions.
