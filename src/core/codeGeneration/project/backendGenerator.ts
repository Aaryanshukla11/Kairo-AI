import { TechnologyStack } from './projectTypes';

export class BackendGenerator {
  public generate(stack: TechnologyStack, projectType: string, files: Record<string, string>): void {
    const isFastAPI = stack.backend === 'FastAPI';

    if (isFastAPI) {
      // 1. requirements.txt
      files['backend/requirements.txt'] = `fastapi>=0.95.0
uvicorn>=0.22.0
pydantic>=2.0.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
python-jose[cryptography]>=3.3.0
passlib[bcrypt]>=1.7.4
python-multipart>=0.0.6
`;

      // 2. main.py
      files['backend/app/main.py'] = `from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, patients, appointments
from app.core.config import settings

app = FastAPI(
    title="${projectType} API Server",
    description="Automatically compiled by Kairo-AI Code Generation Engine M09.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(patients.router, prefix="/api/v1/patients", tags=["Patients"])
app.include_router(appointments.router, prefix="/api/v1/appointments", tags=["Appointments"])

@app.get("/healthz")
async def health_check():
    return {"status": "healthy", "service": settings.PROJECT_NAME}
`;

      // 3. config.py
      files['backend/app/core/config.py'] = `import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  PROJECT_NAME: str = "${projectType}"
  API_V1_STR: str = "/api/v1"
  SECRET_KEY: str = os.getenv("JWT_SECRET", "super-secret-key-signature-algorithm")
  ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
  DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/hospital_db")

settings = Settings()
`;

      // 4. security.py
      files['backend/app/core/security.py'] = `from datetime import datetime, timedelta
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
`;

      // 5. patients.py
      files['backend/app/api/patients.py'] = `from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel

router = APIRouter()

class PatientSchema(BaseModel):
    name: str
    age: int
    condition: str

patients_db = [
    {"id": 1, "name": "Albin Mitchell", "age": 42, "condition": "Post-op checkup"},
    {"id": 2, "name": "Selena Gomez", "age": 31, "condition": "Routine immunization"}
]

@router.get("/", response_model=List[PatientSchema])
async def list_patients(limit: int = 10, offset: int = 0):
    return patients_db[offset:offset+limit]

@router.post("/", response_model=PatientSchema, status_code=status.HTTP_201_CREATED)
async def register_patient(patient: PatientSchema):
    new_p = patient.dict()
    new_p["id"] = len(patients_db) + 1
    patients_db.append(new_p)
    return patient
`;

      // 6. appointments.py
      files['backend/app/api/appointments.py'] = `from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

router = APIRouter()

class AppointmentSchema(BaseModel):
    patient_id: int
    doctor_name: str
    time_slot: str

@router.post("/", status_code=status.HTTP_201_CREATED)
async def schedule_appointment(apt: AppointmentSchema):
    return {"status": "scheduled", "details": apt}
`;
    } else {
      // Node.js Express server
      files['backend/src/server.ts'] = `import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { patientRouter } from './routes/patients';
import { appointmentRouter } from './routes/appointments';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/patients', patientRouter);
app.use('/api/v1/appointments', appointmentRouter);

app.get('/healthz', (req, res) => {
  res.json({ status: 'healthy', project: '${projectType}' });
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(\`Server is listening on port \${port}\`);
});
`;
    }
  }
}

export const backendGenerator = new BackendGenerator();
