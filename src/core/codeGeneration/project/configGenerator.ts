import { TechnologyStack } from './projectTypes';

export class ConfigGenerator {
  public generate(stack: TechnologyStack, files: Record<string, string>): void {
    // 1. Root Dockerfile
    files['Dockerfile'] = `FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend ./
RUN npm run build

FROM python:3.10-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend ./
COPY --from=frontend-builder /app/frontend/dist /app/static

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
`;

    // 2. docker-compose.yml
    files['docker-compose.yml'] = `version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/hospital_db
      - JWT_SECRET=kairo-ai-super-secret-key-signature-hash-algorithms
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=hospital_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`;

    // 3. package.json for frontend
    files['frontend/package.json'] = `{
  "name": "generated-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.4.0",
    "react-router-dom": "^6.11.0"
  },
  "devDependencies": {
    "typescript": "^5.0.4",
    "vite": "^4.3.9",
    "eslint": "^8.41.0",
    "prettier": "^2.8.8",
    "vitest": "^0.31.4"
  }
}
`;

    // 4. tsconfig.json for frontend
    files['frontend/tsconfig.json'] = `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "node",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src"]
}
`;

    // 5. eslint & prettier
    files['.eslintrc.js'] = `module.exports = {
  root: true,
  env: { browser: true, es2020: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': 'warn',
  },
};
`;

    files['.prettierrc'] = `{
  "semi": true,
  "tabWidth": 2,
  "singleQuote": true,
  "printWidth": 100,
  "trailingComma": "none"
}
`;

    files['.env.example'] = `DATABASE_URL=postgresql://postgres:postgres@db:5432/hospital_db
JWT_SECRET=kairo-ai-super-secret-key-signature-hash-algorithms
PORT=8000
`;
  }
}

export const configGenerator = new ConfigGenerator();
