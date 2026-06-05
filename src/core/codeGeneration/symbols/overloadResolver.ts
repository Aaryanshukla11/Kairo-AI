export class OverloadResolver {
  public resolveOverload(name: string, signatureParams: string[]): string {
    return `${name}(${signatureParams.join(', ')})`;
  }
}

export const overloadResolver = new OverloadResolver();
