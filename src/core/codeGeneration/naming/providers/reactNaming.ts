import { NamingProvider } from '../namingRegistry';

export class ReactNaming implements NamingProvider {
  public name = 'ReactNamingRules';

  public isReserved(word: string): boolean {
    return ['useState', 'useEffect', 'useContext', 'useReducer', 'useMemo'].includes(word);
  }
}

export const reactNaming = new ReactNaming();
