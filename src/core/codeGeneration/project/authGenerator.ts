import { TechnologyStack } from './projectTypes';

export class AuthGenerator {
  public generate(stack: TechnologyStack, files: Record<string, string>): void {
    const isFastAPI = stack.backend === 'FastAPI';

    if (isFastAPI) {
      files['backend/app/api/auth.py'] = `from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from datetime import timedelta
from app.core import security
from app.core.config import settings

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class UserCreate(BaseModel):
    email: str
    password: str

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    # Validation logic placeholder
    if form_data.username != "admin@kairo.ai" or form_data.password != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=form_data.username, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup", status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    # Simulated signup persistence
    hashed = security.get_password_hash(user.password)
    return {"email": user.email, "status": "registered"}
`;
    } else {
      files['backend/src/routes/auth.ts'] = `import { Router } from 'express';
import jwt from 'jsonwebtoken';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === 'admin@kairo.ai' && password === 'admin') {
    const token = jwt.sign({ email, role: 'admin' }, 'secret_key_signature', { expiresIn: '1h' });
    return res.json({ access_token: token, token_type: 'bearer' });
  }
  return res.status(401).json({ detail: 'Incorrect credentials' });
});

authRouter.post('/signup', (req, res) => {
  return res.status(201).json({ email: req.body.email, status: 'registered' });
});
`;
    }
  }
}

export const authGenerator = new AuthGenerator();
