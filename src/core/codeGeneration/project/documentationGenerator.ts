import { TechnologyStack } from './projectTypes';

export class DocumentationGenerator {
  public generate(stack: TechnologyStack, projectType: string, files: Record<string, string>): void {
    // 1. README.md
    files['README.md'] = `# ${projectType} Application

Generated autonomously by the **Kairo-AI Software Factory (Phase 9)**.

## Built With the Following Stack
- **Frontend**: ${stack.frontend}
- **Backend**: ${stack.backend}
- **Database**: ${stack.database}
- **Authentication**: ${stack.authentication}
- **Deployment**: ${stack.deployment}

## Project Features
- Production-ready layout design system.
- Standard JWT and secure authentication helpers.
- Fully isolated Docker configurations.
`;

    // 2. INSTALLATION.md
    files['INSTALLATION.md'] = `# Setup & Installation Guide

Follow these instructions to run the generated ${projectType} codebase on your machine.

## Run with Docker (Recommended)
1. **Clone/extract the code** into a clean directory.
2. **Start the containers**:
   \`\`\`bash
   docker-compose up --build
   \`\`\`
3. Open [http://localhost:8000](http://localhost:8000) inside your web browser.

## Run Locally
- **Frontend**:
  \`\`\`bash
  cd frontend
  npm install
  npm run dev
  \`\`\`
- **Backend (Python)**:
  \`\`\`bash
  cd backend
  pip install -r requirements.txt
  uvicorn app.main:app --reload --port 8000
  \`\`\`
`;

    // 3. API_DOCUMENTATION.md
    files['API_DOCUMENTATION.md'] = `# API Route Documentation

## Authentication Endpoints
- **POST** \`/api/v1/auth/signup\` - Registers a new client credential.
- **POST** \`/api/v1/auth/login\` - Authorizes user and returns JWT bearer token.

## Resources Endpoints
- **GET** \`/api/v1/patients/\` - Returns patients directory list with limit/offset queries.
- **POST** \`/api/v1/patients/\` - Creates a patient registration.
- **POST** \`/api/v1/appointments/\` - Schedules patient slots.
`;

    // 4. ARCHITECTURE.md
    files['ARCHITECTURE.md'] = `# Architecture Overview

This project is built using a **Decoupled, Tier-Based Architecture**:
1. **Presentation Layer (Frontend)**: Standard single-page application communicating via client APIs.
2. **Business Logic Layer (Backend)**: FastAPI routes and controllers exposing JSON payloads.
3. **Storage Layer (Database)**: Relational schema managed via PostgreSQL tables.
`;

    // 5. DEPLOYMENT.md
    files['DEPLOYMENT.md'] = `# Deployment Guide

Instructions for deploying to production.

## AWS Deployment (EC2/ECS)
1. Build the release docker image:
   \`\`\`bash
   docker build -t app:latest .
   \`\`\`
2. Push to Amazon Elastic Container Registry (ECR).
3. Create an ECS Task Definition mapping the database URL env.

## Vercel Deployment
- Deploy the frontend folder directly to Vercel dashboard.
`;
  }
}

export const documentationGenerator = new DocumentationGenerator();
