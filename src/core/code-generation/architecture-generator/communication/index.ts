export class CommunicationModeler {
  public getCommunicationRules(architecture: string): string[] {
    const rules: string[] = [
      'Modules must only interact via their public service interfaces.',
      'Database tables are private to modules; cross-module joins are forbidden.',
      'REST APIs must follow canonical paths schemas (e.g. /api/v1/appointments).'
    ];

    if (architecture === 'Microservices' || architecture === 'Event Driven Architecture') {
      rules.push(
        'Asynchronous messaging must proceed through rabbitmq or redis event brokers channels.',
        'Entity changes should emit Domain Events (e.g., PatientAdmittedEvent).'
      );
    }

    return rules;
  }

  public getDataFlow(): string[] {
    return [
      'Client Browser (Presentation React View)',
      ' -> Router / API Controller Handler',
      ' -> Application Usecase Service',
      ' -> Domain Enforcer Model / Entity validations',
      ' -> Infrastructure Repositories Persistence Adapter',
      ' -> PostgreSQL/MySQL Database Instance'
    ];
  }
}

export const communicationModeler = new CommunicationModeler();
export default communicationModeler;
