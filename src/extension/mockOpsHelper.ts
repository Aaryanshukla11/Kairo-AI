import * as fs from 'fs';
import * as path from 'path';
import { generateDiff } from '../core/patch/diffGenerator';

export interface ProposedFile {
  relativePath: string;
  filePath: string;
  content: string;
}

export function getProposedFiles(promptText: string, workspacePath: string): ProposedFile[] {
  const desc = promptText.toLowerCase();
  const files: ProposedFile[] = [];

  const addFile = (relPath: string, content: string) => {
    files.push({
      relativePath: relPath,
      filePath: path.join(workspacePath, relPath),
      content
    });
  };

  if (desc.includes('netflix') || desc.includes('streaming') || desc.includes('movie')) {
    // 1. package.json
    addFile('package.json', JSON.stringify({
      name: "netflix-clone",
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: {
        dev: "vite",
        build: "tsc && vite build",
        preview: "vite preview"
      },
      dependencies: {
        react: "^18.2.0",
        "react-dom": "^18.2.0",
        "lucide-react": "^0.344.0"
      },
      devDependencies: {
        "@types/react": "^18.2.66",
        "@types/react-dom": "^18.2.22",
        "@vitejs/plugin-react": "^4.2.1",
        typescript: "^5.2.2",
        vite: "^5.1.6"
      }
    }, null, 2));

    // 2. tsconfig.json
    addFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ["src"]
    }, null, 2));

    // 3. vite.config.ts
    addFile('vite.config.ts', `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()]\n});`);

    // 4. index.html
    addFile('index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Netflix Clone</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

    // 5. src/index.css
    addFile('src/index.css', `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
body {
  background-color: #141414;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
}`);

    // 6. src/main.tsx
    addFile('src/main.tsx', `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { App } from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`);

    // 7. src/App.tsx
    addFile('src/App.tsx', `import React from 'react';\n\nexport function App() {\n  return <div>Netflix Clone Home</div>;\n}`);
  } 
  else if (desc.includes('react') || desc.includes('todo') || desc.includes('frontend') || desc.includes('webapp') || desc.includes('app')) {
    addFile('package.json', JSON.stringify({
      name: "react-app",
      private: true,
      version: "1.0.0",
      type: "module",
      scripts: { dev: "vite", build: "tsc && vite build" },
      dependencies: { react: "^18.2.0", "react-dom": "^18.2.0", "lucide-react": "^0.344.0" },
      devDependencies: { "@types/react": "^18.2.66", "@vitejs/plugin-react": "^4.2.1", typescript: "^5.2.2", vite: "^5.1.6" }
    }, null, 2));

    addFile('tsconfig.json', JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["DOM", "DOM.Iterable", "ES2020"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true
      },
      include: ["src"]
    }, null, 2));

    addFile('vite.config.ts', `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()]\n});`);

    addFile('index.html', `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`);

    addFile('src/index.css', `body { background-color: #0f172a; color: #ffffff; }`);

    addFile('src/App.tsx', `import React from 'react';\n\nexport function App() {\n  return <div>React Application</div>;\n}`);

    addFile('src/main.tsx', `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport { App } from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`);
  } 
  else if (desc.includes('backend') || desc.includes('server') || desc.includes('express') || desc.includes('node') || desc.includes('api') || desc.includes('rest') || desc.includes('auth') || desc.includes('endpoint')) {
    addFile('package.json', JSON.stringify({
      name: "backend-service",
      version: "1.0.0",
      main: "dist/index.js",
      scripts: { build: "tsc", start: "node dist/index.js", dev: "ts-node-dev src/index.ts" },
      dependencies: { express: "^4.18.2", cors: "^2.8.5", dotenv: "^16.4.5" },
      devDependencies: { "@types/express": "^4.17.21", typescript: "^5.3.3", "ts-node-dev": "^2.0.0" }
    }, null, 2));

    addFile('tsconfig.json', JSON.stringify({ compilerOptions: { target: "ES2022", outDir: "./dist" } }, null, 2));
    addFile('.env', `PORT=3000\nNODE_ENV=development`);
    addFile('src/index.ts', `import express from 'express';\nconst app = express();\napp.listen(3000);`);
  } 
  else {
    addFile('package.json', JSON.stringify({ name: "app", version: "1.0.0", main: "src/index.ts" }, null, 2));
    addFile('src/index.ts', `console.log("App running");`);
    addFile('README.md', `# Application`);
  }

  return files;
}

export function computeFileDiffs(proposedFiles: ProposedFile[]): { changedFiles: string[]; fileContents: Record<string, string> } {
  const changedFiles: string[] = [];
  const fileContents: Record<string, string> = {};

  for (const file of proposedFiles) {
    let oldContent = '';
    if (fs.existsSync(file.filePath)) {
      try {
        oldContent = fs.readFileSync(file.filePath, 'utf8');
      } catch {
        oldContent = '';
      }
    }

    const diff = generateDiff(oldContent, file.content);
    changedFiles.push(file.relativePath);
    fileContents[file.relativePath] = diff;
  }

  return { changedFiles, fileContents };
}
