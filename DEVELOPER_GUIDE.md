# Kairo-AI Developer Guide

Welcome to the Kairo-AI developer documentation. This document will walk you through setting up the workspace, compilation, testing, and debugging workflows.

## Prerequisites
- **Node.js**: v16.0.0 or higher
- **npm**: v8.0.0 or higher
- **VS Code**: v1.80.0 or higher

## Sandbox Workspace Quickstart
1. **Clone the repository**:
   ```bash
   git clone https://github.com/Aaryanshukla11/Sasta-Antigravity-.git Kairo-AI
   cd Kairo-AI
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Compile the extension and webviews**:
   ```bash
   npm run compile
   ```
4. **Launch extension locally**:
   Open the repository folder inside VS Code. Press `F5` to open the Extensions Development Host.

## Executing the Test Suite
- To run integration and unit test assertions:
  ```bash
  npm run test
  ```

## Code Style & Standards
- Run prettier and linter checks prior to committing changes:
  ```bash
  npm run format
  npm run lint
  ```
