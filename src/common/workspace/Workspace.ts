import { ProjectInfo } from './ProjectInfo';

export interface Workspace {
  id: string;
  name: string;
  rootPath: string;
  projectInfo: ProjectInfo;
}
