import { BackupService } from '../backup.service';
export declare class BackupUIController {
    private readonly backupService;
    constructor(backupService: BackupService);
    list(): Promise<string[]>;
    create(): Promise<void>;
    restore(fileName: string): Promise<void>;
    clean(): Promise<void>;
}
