import { TechnologyStack } from './projectTypes';

export class DeploymentGenerator {
  public generate(stack: TechnologyStack, files: Record<string, string>): void {
    // 1. GitHub Actions Pipeline
    files['.github/workflows/deploy.yml'] = `name: Build and Deploy

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build

      - name: Setup Backend Environment
        run: |
          echo "Setting up backend files"
`;

    // 2. vercel.json
    files['vercel.json'] = `{
  "version": 2,
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static" }
  ],
  "routes": [
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "frontend/index.html" }
  ]
}
`;

    // 3. netlify.toml
    files['netlify.toml'] = `[build]
  publish = "frontend/dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  }
}

export const deploymentGenerator = new DeploymentGenerator();
