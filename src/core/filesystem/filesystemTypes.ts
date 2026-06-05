export enum FilesystemEventType {
  FileRead = 'FileRead',
  FileCreated = 'FileCreated',
  FileUpdated = 'FileUpdated',
  FileDeleted = 'FileDeleted',
  DirectoryCreated = 'DirectoryCreated'
}

export interface FilesystemEvent {
  type: FilesystemEventType;
  path: string;
  timestamp: number;
  payload?: any;
}

export type FilesystemEventListener = (event: FilesystemEvent) => void;

export interface FileStat {
  size: number;
  isFile: boolean;
  isDirectory: boolean;
  mtime: number;
  birthtime: number;
}
