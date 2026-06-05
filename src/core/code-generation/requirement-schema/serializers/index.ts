import { IEnterpriseRequirement } from '../contracts';

export class RequirementSerializer {
  public serialize(req: IEnterpriseRequirement): string {
    return JSON.stringify(req, null, 2);
  }

  public deserialize(serialized: string): IEnterpriseRequirement {
    const parsed = JSON.parse(serialized);
    return Object.freeze(parsed) as IEnterpriseRequirement;
  }
}

export const requirementSerializer = new RequirementSerializer();
