import { ProjectArchitecture, ProjectBlueprint, TechnologyStack } from './projectTypes';

export class BlueprintGenerator {
  public generate(stack: TechnologyStack, arch: ProjectArchitecture, projectType: string): ProjectBlueprint {
    const fileList: string[] = [
      'README.md',
      'INSTALLATION.md',
      'API_DOCUMENTATION.md',
      'ARCHITECTURE.md',
      'DEPLOYMENT.md',
      '.env.example',
      'Dockerfile',
      'docker-compose.yml',
      '.gitignore',
      '.prettierrc',
      '.eslintrc.js'
    ];

    // Append frontend files
    const feExt = stack.frontend === 'Svelte' || stack.frontend === 'Vue' ? 'vue' : 'tsx';
    fileList.push(
      'frontend/package.json',
      'frontend/tsconfig.json',
      'frontend/src/index.css',
      'frontend/src/main.tsx',
      `frontend/src/App.${feExt}`,
      'frontend/src/components/Navbar.tsx',
      'frontend/src/components/Sidebar.tsx',
      'frontend/src/components/Dashboard.tsx',
      'frontend/src/components/PatientForm.tsx',
      'frontend/src/components/AppointmentModal.tsx',
      'frontend/src/components/InvoiceTable.tsx',
      'frontend/src/components/LoginForm.tsx',
      'frontend/src/components/SignupForm.tsx',
      'frontend/src/services/authService.ts',
      'frontend/src/services/apiService.ts',
      'frontend/tests/unit/components.test.tsx',
      'frontend/tests/integration/app.test.tsx'
    );

    // Append backend files
    const beExt = 'ts';
    if (stack.backend === 'FastAPI') {
      fileList.push(
        'backend/requirements.txt',
        'backend/Dockerfile',
        'backend/app/main.py',
        'backend/app/core/config.py',
        'backend/app/core/security.py',
        'backend/app/api/auth.py',
        'backend/app/api/patients.py',
        'backend/app/api/appointments.py',
        'backend/app/models/patient.py',
        'backend/app/models/appointment.py',
        'backend/app/schemas/patient.py',
        'backend/app/schemas/appointment.py',
        'backend/app/services/patient_service.py',
        'backend/app/services/appointment_service.py',
        'backend/tests/test_auth.py',
        'backend/tests/test_patients.py'
      );
    } else {
      fileList.push(
        'backend/package.json',
        'backend/tsconfig.json',
        'backend/src/server.ts',
        'backend/src/routes/auth.ts',
        'backend/src/routes/patients.ts',
        'backend/src/routes/appointments.ts',
        'backend/src/controllers/authController.ts',
        'backend/src/controllers/patientController.ts',
        'backend/src/controllers/appointmentController.ts',
        'backend/src/middlewares/authMiddleware.ts',
        'backend/src/middlewares/validationMiddleware.ts',
        'backend/src/services/db.ts',
        'backend/tests/unit/auth.test.ts',
        'backend/tests/integration/patients.test.ts'
      );
    }

    // Append database files
    fileList.push(
      'database/schema.sql',
      'database/migrations/01_init_schema.sql',
      'database/seeders/01_mock_data.sql',
      'database/indexes.sql'
    );

    // Append deployment files
    fileList.push(
      '.github/workflows/deploy.yml',
      'vercel.json',
      'netlify.toml'
    );

    // Package dependencies
    const dependencies: Record<string, string> = {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      axios: '^1.4.0',
      'react-router-dom': '^6.11.0'
    };

    const devDependencies: Record<string, string> = {
      typescript: '^5.0.4',
      vite: '^4.3.9',
      eslint: '^8.41.0',
      prettier: '^2.8.8',
      vitest: '^0.31.4'
    };

    const envVariables = {
      DATABASE_URL: 'postgresql://postgres:postgres@db:5432/hospital_db',
      JWT_SECRET: 'kairo-ai-super-secret-key-signature-hash-algorithms',
      PORT: '8000',
      API_URL: 'http://localhost:8000/api/v1'
    };

    const directoryTree = `
.
├── .github
│   └── workflows
│       └── deploy.yml
├── backend
│   ├── app
│   │   ├── api
│   │   ├── core
│   │   ├── models
│   │   ├── schemas
│   │   └── services
│   ├── Dockerfile
│   └── requirements.txt
├── database
│   ├── migrations
│   └── seeders
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── styles
│   ├── package.json
│   └── tsconfig.json
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── README.md
├── INSTALLATION.md
├── API_DOCUMENTATION.md
├── ARCHITECTURE.md
└── DEPLOYMENT.md
`;

    return {
      directoryTree,
      fileList,
      dependencies,
      devDependencies,
      envVariables,
      buildConfig: {
        target: 'es2022',
        minify: true,
        sourcemap: false
      }
    };
  }
}

export const blueprintGenerator = new BlueprintGenerator();
