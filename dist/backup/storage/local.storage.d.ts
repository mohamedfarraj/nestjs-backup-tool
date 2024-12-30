/// <reference types="node" />
/// <reference types="node" />
import { Storage } from './storage.interface';
import { LocalStorageConfig } from '../interfaces/backup-options.interface';
export declare class LocalStorage implements Storage {
    private readonly config;
    constructor(config: LocalStorageConfig);
    save(filePath: string, fileName: string): Promise<void>;
    get(fileName: string): Promise<Buffer>;
    delete(fileName: string): Promise<void>;
    list(): Promise<string[]>;
}
