export class FeatureDetector {
  private featuresList: { key: string; keywords: string[] }[] = [
    { key: 'Authentication', keywords: ['login', 'auth ', 'sign in', 'signup', 'authentication'] },
    { key: 'Authorization', keywords: ['authorization', 'access control', 'guard routes'] },
    { key: 'Dashboard', keywords: ['dashboard', 'admin screen', 'metrics chart'] },
    { key: 'Admin Panel', keywords: ['admin panel', 'backoffice', 'administration'] },
    { key: 'User Management', keywords: ['user management', 'manage users', 'profile editing'] },
    { key: 'Payments', keywords: ['payments', 'stripe checkout', 'billing', 'paypal', 'credit card'] },
    { key: 'Notifications', keywords: ['notifications', 'push notification', 'alerts'] },
    { key: 'Chat', keywords: ['chat room', 'realtime messaging', 'direct message'] },
    { key: 'Search', keywords: ['search bar', 'find items', 'filter queries'] },
    { key: 'Analytics', keywords: ['analytics', 'charts', 'telemetry', 'reporting'] },
    { key: 'Reporting', keywords: ['reporting', 'generate report', 'pdf export'] },
    { key: 'Email', keywords: ['send email', 'mailer', 'smtp'] },
    { key: 'OTP', keywords: ['otp', 'two factor', '2fa', 'verification code'] },
    { key: 'Roles', keywords: ['user roles', 'rbac', 'admin role'] },
    { key: 'Permissions', keywords: ['permissions', 'permission gates'] },
    { key: 'Dark Mode', keywords: ['dark mode', 'theme switching'] },
    { key: 'Light Mode', keywords: ['light mode'] },
    { key: 'Internationalization', keywords: ['i18n', 'translation', 'multilingual', 'locales'] },
    { key: 'Offline Mode', keywords: ['offline mode', 'pwa offline', 'local cache sync'] },
    { key: 'Realtime', keywords: ['realtime', 'live sync', 'instant updates'] },
    { key: 'AI Chat', keywords: ['ai chat', 'llm assistant', 'copilot chat'] },
    { key: 'File Upload', keywords: ['file upload', 'upload document', 's3 upload'] },
    { key: 'Image Upload', keywords: ['image upload', 'avatar upload', 'cloudinary upload'] },
    { key: 'Maps', keywords: ['maps', 'google maps', 'leaflet'] },
    { key: 'Calendar', keywords: ['calendar', 'scheduling appointments', 'booking schedule'] },
    { key: 'Video', keywords: ['video recording', 'video call', 'streaming video'] },
    { key: 'Audio', keywords: ['audio recording', 'sound play'] },
    { key: 'Export', keywords: ['csv export', 'export to excel', 'pdf generator'] },
    { key: 'Import', keywords: ['csv import', 'bulk upload'] }
  ];

  private integrationsList: { key: string; keywords: string[] }[] = [
    { key: 'Stripe', keywords: ['stripe'] },
    { key: 'PayPal', keywords: ['paypal'] },
    { key: 'Google Maps', keywords: ['google maps', 'google-maps'] },
    { key: 'SendGrid', keywords: ['sendgrid'] },
    { key: 'Twilio', keywords: ['twilio', 'sms api'] },
    { key: 'Auth0', keywords: ['auth0'] },
    { key: 'GitHub API', keywords: ['github api', 'octokit'] },
    { key: 'Slack Webhook', keywords: ['slack webhook', 'slack channel notification'] },
    { key: 'AWS S3', keywords: ['aws s3', 'amazon s3', 's3 bucket'] }
  ];

  private aiFeaturesList: { key: string; keywords: string[] }[] = [
    { key: 'Chatbot', keywords: ['chatbot', 'assistant bot'] },
    { key: 'LLM', keywords: ['llm', 'large language model', 'gpt-4', 'gemini'] },
    { key: 'OCR', keywords: ['ocr', 'text recognition', 'tesseract'] },
    { key: 'Speech', keywords: ['speech-to-text', 'speech recognition', 'whisper'] },
    { key: 'Translation', keywords: ['translation engine', 'auto translate'] },
    { key: 'Summarization', keywords: ['summarize', 'text summarization'] },
    { key: 'Vision', keywords: ['computer vision', 'object detection', 'image classification'] },
    { key: 'Recommendation', keywords: ['recommendation engine', 'suggest products', 'personalized feed'] },
    { key: 'Code Generation', keywords: ['code generator', 'generate scripts'] },
    { key: 'Embeddings', keywords: ['vector embeddings', 'text-embedding'] },
    { key: 'Vector Search', keywords: ['vector search', 'semantic similarity', 'pgvector'] }
  ];

  private specialRequirementsList: { key: string; keywords: string[] }[] = [
    { key: 'PCI-DSS Compliance', keywords: ['pci compliance', 'pci-dss', 'payment compliance'] },
    { key: 'GDPR Compliance', keywords: ['gdpr', 'privacy policy compliance', 'right to be forgotten'] },
    { key: 'HIPAA Compliance', keywords: ['hipaa', 'medical compliance', 'healthcare security compliance'] },
    { key: 'High Availability', keywords: ['high availability', 'load balancer', 'failover redundancy'] },
    { key: 'Multi-tenant', keywords: ['multi-tenant', 'saas multi-tenancy', 'subdomain routing'] },
    { key: 'Real-time Sync', keywords: ['real-time synchronization', 'instant sync'] },
    { key: 'PWA', keywords: ['pwa', 'progressive web app'] }
  ];

  private filterList(prompt: string, list: { key: string; keywords: string[] }[]): string[] {
    const clean = prompt.toLowerCase();
    const detected: string[] = [];
    for (const item of list) {
      for (const keyword of item.keywords) {
        if (clean.includes(keyword)) {
          detected.push(item.key);
          break; // Avoid adding same item multiple times if multiple keywords match
        }
      }
    }
    return detected;
  }

  public detect(prompt: string) {
    return {
      features: this.filterList(prompt, this.featuresList),
      integrations: this.filterList(prompt, this.integrationsList),
      aiFeatures: this.filterList(prompt, this.aiFeaturesList),
      specialRequirements: this.filterList(prompt, this.specialRequirementsList)
    };
  }
}

export const featureDetector = new FeatureDetector();
export default featureDetector;
