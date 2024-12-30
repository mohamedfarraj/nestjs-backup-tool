/// <reference types="node" />
/// <reference types="node" />
import { Storage } from './storage.interface';
import { S3StorageConfig } from '../interfaces/backup-options.interface';
export declare class S3Storage implements Storage {
    private readonly config;
    private readonly s3Client;
    private readonly logger;
    constructor(config: S3StorageConfig);
    save(filePath: string, fileName: string): Promise<void>;
    get(fileName: string): Promise<Buffer>;
    delete(fileName: string): Promise<void>;
    list(): Promise<string[]>;
}
