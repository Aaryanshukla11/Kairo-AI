export class PromptSanitizer {
  public sanitize(text: string): string {
    // Basic regex filters for credentials and keys
    return text
      .replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[JWT SECRET SCRUBBED]') // JWT tokens
      .replace(/AIzaSy[A-Za-z0-9-_]{33}/g, '[GOOGLE API KEY SCRUBBED]') // Google API Keys
      .replace(/(sk_[a-zA-Z0-9]{20,50})/g, '[API KEY SCRUBBED]') // OpenAI/Generic API Keys
      .replace(/(password|passwd|secret|private_key)\s*[:=]\s*[^\s'"]+/gi, '$1: [SCRUBBED]'); // Passwords / secrets
  }
}

export const promptSanitizer = new PromptSanitizer();
