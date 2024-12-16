export interface Storage {
  save(filePath: string, fileName: string): Promise<void>;
  get(fileName: string): Promise<Buffer>;
  delete(fileName: string): Promise<void>;
  list(): Promise<string[]>;
} 