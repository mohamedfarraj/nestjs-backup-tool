import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { BackupOptions } from './interfaces/backup-options.interface';
import { StorageFactory } from './storage/storage.factory';
export declare class BackupService implements OnModuleInit, OnModuleDestroy {
    private readonly options;
    private readonly storageFactory;
    private schedulerRegistry;
    private readonly logger;
    private readonly tempDir;
    private readonly BACKUP_JOB_NAME;
    constructor(options: BackupOptions, storageFactory: StorageFactory, schedulerRegistry: SchedulerRegistry);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    createBackup(): Promise<void>;
    restore(fileName: string): Promise<void>;
    list(): Promise<string[]>;
    clean(): Promise<void>;
    private createDatabaseDump;
    private restoreDatabase;
    private extractTimestampFromFileName;
    private sendNotification;
    private checkDatabaseTools;
}
