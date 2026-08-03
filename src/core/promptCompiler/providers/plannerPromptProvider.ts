import { PromptRequest } from '../promptTypes';
import { planningTemplate } from '../templates/planning.template';

export class PlannerPromptProvider {
  public getTemplate() {
    return planningTemplate;
  }
}
