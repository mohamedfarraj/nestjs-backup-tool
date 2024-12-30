import { StorageConfig } from '../interfaces/backup-options.interface';
import { Storage } from './storage.interface';
export declare class StorageFactory {
    createStorage(config: StorageConfig): Storage;
}
