import { BackupOptions } from './interfaces/backup-options.interface';
import { StorageFactory } from './storage/storage.factory';
export declare class BackupService {
    private readonly options;
    private readonly storageFactory;
    private readonly logger;
    private readonly tempDir;
    constructor(options: BackupOptions, storageFactory: StorageFactory);
    scheduledBackup(): Promise<void>;
    createBackup(): Promise<void>;
    restore(fileName: string): Promise<void>;
    list(): Promise<string[]>;
    clean(): Promise<void>;
    private createDatabaseDump;
    private restoreDatabase;
    private extractTimestampFromFileName;
    private sendNotification;
}
