import { IEntity } from '../types';

interface ITechMapping {
  key: string;
  keywords: string[];
  confidence: number;
}

export class TechDetector {
  private languages: ITechMapping[] = [
    { key: 'TypeScript', keywords: ['typescript', 'ts'], confidence: 0.98 },
    { key: 'JavaScript', keywords: ['javascript', 'js'], confidence: 0.98 },
    { key: 'Python', keywords: ['python', 'py'], confidence: 0.98 },
    { key: 'Go', keywords: ['golang', 'go language', ' go '], confidence: 0.95 },
    { key: 'Java', keywords: ['java '], confidence: 0.95 },
    { key: 'Rust', keywords: ['rust '], confidence: 0.95 },
    { key: 'C#', keywords: ['c#', 'csharp'], confidence: 0.95 },
    { key: 'PHP', keywords: ['php'], confidence: 0.95 },
    { key: 'Ruby', keywords: ['ruby'], confidence: 0.95 }
  ];

  private frontends: ITechMapping[] = [
    { key: 'React', keywords: ['react', 'reactjs', 'react.js'], confidence: 0.98 },
    { key: 'Next.js', keywords: ['next.js', 'nextjs', 'next '], confidence: 0.98 },
    { key: 'Vue', keywords: ['vue', 'vuejs', 'vue.js'], confidence: 0.98 },
    { key: 'Angular', keywords: ['angular', 'angularjs'], confidence: 0.98 },
    { key: 'Svelte', keywords: ['svelte', 'sveltekits'], confidence: 0.98 }
  ];

  private backends: ITechMapping[] = [
    { key: 'Node.js', keywords: ['node', 'nodejs', 'node.js'], confidence: 0.98 },
    { key: 'Express', keywords: ['express', 'expressjs', 'express.js'], confidence: 0.95 },
    { key: 'NestJS', keywords: ['nestjs', 'nest.js'], confidence: 0.98 },
    { key: 'Spring Boot', keywords: ['spring boot', 'spring framework'], confidence: 0.98 },
    { key: 'Django', keywords: ['django'], confidence: 0.98 },
    { key: 'Flask', keywords: ['flask'], confidence: 0.95 },
    { key: 'Laravel', keywords: ['laravel'], confidence: 0.98 },
    { key: 'ASP.NET', keywords: ['asp.net', 'dotnet', '.net core'], confidence: 0.98 },
    { key: 'FastAPI', keywords: ['fastapi'], confidence: 0.98 }
  ];

  private databases: ITechMapping[] = [
    { key: 'PostgreSQL', keywords: ['postgresql', 'postgres'], confidence: 0.98 },
    { key: 'MySQL', keywords: ['mysql'], confidence: 0.98 },
    { key: 'MariaDB', keywords: ['mariadb'], confidence: 0.98 },
    { key: 'SQLite', keywords: ['sqlite'], confidence: 0.98 },
    { key: 'MongoDB', keywords: ['mongodb', 'mongo'], confidence: 0.98 },
    { key: 'Redis', keywords: ['redis'], confidence: 0.95 },
    { key: 'Firebase', keywords: ['firebase', 'firestore'], confidence: 0.95 },
    { key: 'Supabase', keywords: ['supabase'], confidence: 0.98 },
    { key: 'Oracle', keywords: ['oracle database', 'oracle sql'], confidence: 0.95 },
    { key: 'SQL Server', keywords: ['sql server', 'mssql'], confidence: 0.95 }
  ];

  private authMethods: ITechMapping[] = [
    { key: 'JWT', keywords: ['jwt', 'json web token'], confidence: 0.9 },
    { key: 'OAuth', keywords: ['oauth', 'oauth2', 'google login', 'github login'], confidence: 0.9 },
    { key: 'Session', keywords: ['session', 'cookie session'], confidence: 0.8 },
    { key: 'Auth0', keywords: ['auth0'], confidence: 0.95 },
    { key: 'Firebase Auth', keywords: ['firebase auth', 'firebase authentication'], confidence: 0.95 },
    { key: 'Supabase Auth', keywords: ['supabase auth'], confidence: 0.95 }
  ];

  private apiStyles: ITechMapping[] = [
    { key: 'REST', keywords: ['rest ', 'restful', 'http api'], confidence: 0.85 },
    { key: 'GraphQL', keywords: ['graphql', 'gql'], confidence: 0.98 },
    { key: 'gRPC', keywords: ['grpc'], confidence: 0.98 },
    { key: 'tRPC', keywords: ['trpc'], confidence: 0.98 },
    { key: 'WebSockets', keywords: ['websocket', 'socket.io', 'realtime sockets'], confidence: 0.9 }
  ];

  private uiFrameworks: ITechMapping[] = [
    { key: 'Material UI', keywords: ['mui', 'material ui', 'material-ui'], confidence: 0.95 },
    { key: 'Ant Design', keywords: ['antd', 'ant design'], confidence: 0.95 },
    { key: 'Chakra UI', keywords: ['chakra', 'chakra ui'], confidence: 0.95 },
    { key: 'Radix UI', keywords: ['radix', 'radix ui'], confidence: 0.95 },
    { key: 'Shadcn UI', keywords: ['shadcn', 'shadcn ui'], confidence: 0.98 }
  ];

  private cssFrameworks: ITechMapping[] = [
    { key: 'Tailwind CSS', keywords: ['tailwind', 'tailwindcss'], confidence: 0.98 },
    { key: 'Bootstrap', keywords: ['bootstrap'], confidence: 0.98 },
    { key: 'Bulma', keywords: ['bulma'], confidence: 0.95 },
    { key: 'CSS Modules', keywords: ['css modules', 'css-modules'], confidence: 0.9 },
    { key: 'Styled Components', keywords: ['styled components', 'styled-components'], confidence: 0.95 }
  ];

  private stateManagements: ITechMapping[] = [
    { key: 'Redux', keywords: ['redux', 'redux toolkit', 'rtk'], confidence: 0.95 },
    { key: 'Zustand', keywords: ['zustand'], confidence: 0.98 },
    { key: 'MobX', keywords: ['mobx'], confidence: 0.95 },
    { key: 'Pinia', keywords: ['pinia'], confidence: 0.95 },
    { key: 'Vuex', keywords: ['vuex'], confidence: 0.95 }
  ];

  private buildTools: ITechMapping[] = [
    { key: 'Webpack', keywords: ['webpack'], confidence: 0.9 },
    { key: 'Vite', keywords: ['vite'], confidence: 0.98 },
    { key: 'Esbuild', keywords: ['esbuild'], confidence: 0.95 },
    { key: 'Cargo', keywords: ['cargo build'], confidence: 0.95 },
    { key: 'Maven', keywords: ['maven', 'pom.xml'], confidence: 0.95 },
    { key: 'Gradle', keywords: ['gradle'], confidence: 0.95 }
  ];

  private packageManagers: ITechMapping[] = [
    { key: 'NPM', keywords: ['npm install', 'package.json'], confidence: 0.8 },
    { key: 'Yarn', keywords: ['yarn add', 'yarn.lock'], confidence: 0.9 },
    { key: 'PNPM', keywords: ['pnpm'], confidence: 0.95 },
    { key: 'Pip', keywords: ['pip install', 'requirements.txt'], confidence: 0.95 },
    { key: 'Cargo', keywords: ['cargo add', 'cargo.toml'], confidence: 0.95 }
  ];

  private testingFrameworks: ITechMapping[] = [
    { key: 'Jest', keywords: ['jest'], confidence: 0.95 },
    { key: 'PyTest', keywords: ['pytest'], confidence: 0.95 },
    { key: 'Mocha', keywords: ['mocha'], confidence: 0.9 },
    { key: 'Cypress', keywords: ['cypress'], confidence: 0.95 },
    { key: 'Playwright', keywords: ['playwright'], confidence: 0.95 },
    { key: 'Vitest', keywords: ['vitest'], confidence: 0.98 }
  ];

  private deploymentTargets: ITechMapping[] = [
    { key: 'AWS', keywords: ['aws', 'amazon web services', 's3', 'ec2'], confidence: 0.9 },
    { key: 'GCP', keywords: ['gcp', 'google cloud', 'app engine'], confidence: 0.9 },
    { key: 'Azure', keywords: ['azure'], confidence: 0.9 },
    { key: 'Vercel', keywords: ['vercel'], confidence: 0.95 },
    { key: 'Heroku', keywords: ['heroku'], confidence: 0.95 },
    { key: 'Docker', keywords: ['docker', 'containerize'], confidence: 0.95 },
    { key: 'Kubernetes', keywords: ['k8s', 'kubernetes'], confidence: 0.95 }
  ];

  private operatingSystems: ITechMapping[] = [
    { key: 'Linux', keywords: ['linux', 'ubuntu', 'debian', 'alpine'], confidence: 0.85 },
    { key: 'Windows', keywords: ['windows', 'win32'], confidence: 0.85 },
    { key: 'macOS', keywords: ['macos', 'osx', 'darwin'], confidence: 0.85 }
  ];

  private targetPlatforms: ITechMapping[] = [
    { key: 'Web', keywords: ['web app', 'website', 'browser app'], confidence: 0.8 },
    { key: 'iOS', keywords: ['ios', 'iphone', 'ipad'], confidence: 0.95 },
    { key: 'Android', keywords: ['android', 'apk'], confidence: 0.95 },
    { key: 'Desktop', keywords: ['desktop application', 'electron', 'tauri'], confidence: 0.95 },
    { key: 'Cross-Platform', keywords: ['cross-platform', 'react native', 'flutter'], confidence: 0.95 }
  ];

  private findMatch(prompt: string, list: ITechMapping[]): IEntity<string> {
    const clean = prompt.toLowerCase();
    for (const mapping of list) {
      for (const keyword of mapping.keywords) {
        if (clean.includes(keyword)) {
          return { value: mapping.key, confidence: mapping.confidence };
        }
      }
    }
    return { value: null, confidence: 0.0 };
  }

  public detectProjectName(prompt: string): IEntity<string> {
    // Looks for patterns like "called X", "named Y", "project Z"
    const match = prompt.match(/\b(?:called|named|project)\s+["']?([a-zA-Z0-9_-]+)["']?/i);
    if (match && match[1]) {
      return { value: match[1], confidence: 0.9 };
    }
    return { value: null, confidence: 0.0 };
  }

  public detect(prompt: string) {
    return {
      projectName: this.detectProjectName(prompt),
      language: this.findMatch(prompt, this.languages),
      frontend: this.findMatch(prompt, this.frontends),
      backend: this.findMatch(prompt, this.backends),
      database: this.findMatch(prompt, this.databases),
      authMethod: this.findMatch(prompt, this.authMethods),
      apiStyle: this.findMatch(prompt, this.apiStyles),
      uiFramework: this.findMatch(prompt, this.uiFrameworks),
      cssFramework: this.findMatch(prompt, this.cssFrameworks),
      stateManagement: this.findMatch(prompt, this.stateManagements),
      buildTool: this.findMatch(prompt, this.buildTools),
      packageManager: this.findMatch(prompt, this.packageManagers),
      testingFramework: this.findMatch(prompt, this.testingFrameworks),
      deploymentTarget: this.findMatch(prompt, this.deploymentTargets),
      operatingSystem: this.findMatch(prompt, this.operatingSystems),
      targetPlatform: this.findMatch(prompt, this.targetPlatforms)
    };
  }
}

export const techDetector = new TechDetector();
export default techDetector;
