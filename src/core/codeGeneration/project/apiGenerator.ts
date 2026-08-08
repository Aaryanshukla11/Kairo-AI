import { TechnologyStack } from './projectTypes';

export class ApiGenerator {
  public generate(stack: TechnologyStack, files: Record<string, string>): void {
    // Generate api endpoints helpers & typings
    files['frontend/src/services/apiService.ts'] = `import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

export const apiService = {
  async get(endpoint: string, params = {}) {
    const token = localStorage.getItem('token');
    const response = await axios.get(\`\${API_BASE}\${endpoint}\`, {
      params,
      headers: token ? { Authorization: \`Bearer \${token}\` } : {}
    });
    return response.data;
  },

  async post(endpoint: string, data = {}) {
    const token = localStorage.getItem('token');
    const response = await axios.post(\`\${API_BASE}\${endpoint}\`, data, {
      headers: token ? { Authorization: \`Bearer \${token}\` } : {}
    });
    return response.data;
  }
};
`;

    files['frontend/src/services/authService.ts'] = `import { apiService } from './apiService';

export const authService = {
  async login(email: string, pass: string) {
    const data = new URLSearchParams();
    data.append('username', email);
    data.append('password', pass);
    const res = await apiService.post('/auth/login', data);
    if (res.access_token) {
      localStorage.setItem('token', res.access_token);
    }
    return res;
  },

  async logout() {
    localStorage.removeItem('token');
  }
};
`;
  }
}

export const apiServiceGenerator = new ApiGenerator();
export const apiGenerator = apiServiceGenerator;
