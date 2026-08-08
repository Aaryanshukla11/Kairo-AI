export class PromptProcessorLogger {
  public info(message: string, context?: any): void {
    const formatted = `[${new Date().toISOString()}] [INFO] [PromptProcessor] ${message} ${context ? JSON.stringify(context) : ''}`;
    console.log(formatted);
  }

  public warn(message: string, context?: any): void {
    const formatted = `[${new Date().toISOString()}] [WARN] [PromptProcessor] ${message} ${context ? JSON.stringify(context) : ''}`;
    console.warn(formatted);
  }

  public error(message: string, context?: any): void {
    const formatted = `[${new Date().toISOString()}] [ERROR] [PromptProcessor] ${message} ${context ? JSON.stringify(context) : ''}`;
    console.error(formatted);
  }
}

export const logger = new PromptProcessorLogger();
export default logger;
