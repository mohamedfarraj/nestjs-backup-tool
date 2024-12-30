/// <reference types="node" />
/// <reference types="node" />
import { Storage } from './storage.interface';
import { FTPStorageConfig } from '../interfaces/backup-options.interface';
export declare class FTPStorage implements Storage {
    private readonly config;
    private client;
    private readonly logger;
    constructor(config: FTPStorageConfig);
    save(filePath: string, fileName: string): Promise<void>;
    get(fileName: string): Promise<Buffer>;
    delete(fileName: string): Promise<void>;
    list(): Promise<string[]>;
}
