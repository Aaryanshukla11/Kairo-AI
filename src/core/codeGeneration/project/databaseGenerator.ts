export class DatabaseGenerator {
  public generate(database: string, projectType: string, files: Record<string, string>): void {
    const isPostgres = database === 'PostgreSQL';

    // 1. schema.sql
    files['database/schema.sql'] = `
-- Kairo-AI Generated: ${projectType} SQL Schema
-- Target Database: ${database}

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL,
    condition VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INT REFERENCES patients(id) ON DELETE CASCADE,
    doctor_name VARCHAR(255) NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

    // 2. migrations/01_init_schema.sql
    files['database/migrations/01_init_schema.sql'] = files['database/schema.sql'];

    // 3. seeders/01_mock_data.sql
    files['database/seeders/01_mock_data.sql'] = `
-- Seed initial records for demonstration
INSERT INTO users (email, password_hash, role) VALUES
('admin@kairo.ai', '$2b$12$KairoAdminSecretPasswordHashedHere...', 'admin'),
('doctor@kairo.ai', '$2b$12$KairoDoctorSecretPasswordHashedHere...', 'doctor')
ON CONFLICT DO NOTHING;

INSERT INTO patients (name, age, condition) VALUES
('Albin Mitchell', 42, 'Post-op checkup'),
('Selena Gomez', 31, 'Routine immunization')
ON CONFLICT DO NOTHING;
`;

    // 4. indexes.sql
    files['database/indexes.sql'] = `
-- Optimized access query indices
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
`;
  }
}

export const databaseGenerator = new DatabaseGenerator();
