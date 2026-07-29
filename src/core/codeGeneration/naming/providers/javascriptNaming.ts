import { NamingProvider } from '../namingRegistry';

export class JavaScriptNaming implements NamingProvider {
  public name = 'JavaScriptNamingRules';

  public isReserved(word: string): boolean {
    return ['window', 'document', 'undefined', 'null', 'prototype'].includes(word);
  }
}

export const javascriptNaming = new JavaScriptNaming();
