import { IFilesystemAdapter } from '../workspace-engine/fs-adapter';
import { IExecutionProfile } from './types';

export class EnvironmentDetector {
  public async resolveProfile(
    workspacePath: string,
    fs: IFilesystemAdapter
  ): Promise<IExecutionProfile> {
    let packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown' = 'unknown';
    let runtime: 'Node.js' | 'Java' | 'Python' | 'Go' | 'Rust' | '.NET' | 'unknown' = 'unknown';
    let framework = 'unknown';
    let buildTool = 'unknown';

    // 1. Detect Package Manager and Runtime based on lockfiles
    if (await fs.exists(`${workspacePath}/package-lock.json`)) {
      packageManager = 'npm';
      runtime = 'Node.js';
    } else if (await fs.exists(`${workspacePath}/pnpm-lock.yaml`)) {
      packageManager = 'pnpm';
      runtime = 'Node.js';
    } else if (await fs.exists(`${workspacePath}/yarn.lock`)) {
      packageManager = 'yarn';
      runtime = 'Node.js';
    } else if (await fs.exists(`${workspacePath}/bun.lockb`)) {
      packageManager = 'bun';
      runtime = 'Node.js';
    }

    // Non-JS runtime detections
    if (await fs.exists(`${workspacePath}/pom.xml`) || await fs.exists(`${workspacePath}/build.gradle`)) {
      runtime = 'Java';
      framework = 'Spring Boot';
      buildTool = await fs.exists(`${workspacePath}/pom.xml`) ? 'Maven' : 'Gradle';
    } else if (await fs.exists(`${workspacePath}/requirements.txt`) || await fs.exists(`${workspacePath}/pyproject.toml`)) {
      runtime = 'Python';
      framework = 'Django'; // Default fallback assumption
    } else if (await fs.exists(`${workspacePath}/go.mod`)) {
      runtime = 'Go';
    } else if (await fs.exists(`${workspacePath}/Cargo.toml`)) {
      runtime = 'Rust';
    }

    // 2. Parse package.json if present
    if (runtime === 'Node.js' && await fs.exists(`${workspacePath}/package.json`)) {
      try {
        const pjsContent = await fs.readFile(`${workspacePath}/package.json`);
        const pjs = JSON.parse(pjsContent);
        const deps = { ...pjs.dependencies, ...pjs.devDependencies };

        // Framework checks
        if (deps['next']) framework = 'Next.js';
        else if (deps['@nestjs/core']) framework = 'NestJS';
        else if (deps['react']) framework = 'React';
        else if (deps['vue']) framework = 'Vue';
        else if (deps['express']) framework = 'Express';

        // Build tool checks
        if (deps['vite']) buildTool = 'Vite';
        else if (deps['webpack']) buildTool = 'Webpack';
        else if (deps['rollup']) buildTool = 'Rollup';
      } catch (err) {
        // Fallback silently if package.json is malformed
      }
    }

    // 3. Assemble command configurations
    let installCommand = 'npm install';
    let buildCommand = 'npm run build';
    let devCommand = 'npm run dev';
    let prodCommand = 'npm start';
    let testCommand = 'npm test';

    if (packageManager === 'pnpm') {
      installCommand = 'pnpm install';
      buildCommand = 'pnpm build';
      devCommand = 'pnpm dev';
      prodCommand = 'pnpm start';
      testCommand = 'pnpm test';
    } else if (packageManager === 'yarn') {
      installCommand = 'yarn install';
      buildCommand = 'yarn build';
      devCommand = 'yarn dev';
      prodCommand = 'yarn start';
      testCommand = 'yarn test';
    } else if (packageManager === 'bun') {
      installCommand = 'bun install';
      buildCommand = 'bun build';
      devCommand = 'bun dev';
      prodCommand = 'bun start';
      testCommand = 'bun test';
    } else if (runtime === 'Java') {
      installCommand = buildTool === 'Maven' ? 'mvn install' : './gradlew build';
      buildCommand = buildTool === 'Maven' ? 'mvn compile' : './gradlew assemble';
      devCommand = buildTool === 'Maven' ? 'mvn spring-boot:run' : './gradlew bootRun';
      prodCommand = 'java -jar target/app.jar';
      testCommand = buildTool === 'Maven' ? 'mvn test' : './gradlew test';
    }

    return {
      packageManager,
      installCommand,
      buildCommand,
      devCommand,
      prodCommand,
      testCommand,
      workingDirectory: workspacePath,
      runtime,
      framework,
      buildTool
    };
  }
}

export const environmentDetector = new EnvironmentDetector();
export default environmentDetector;
