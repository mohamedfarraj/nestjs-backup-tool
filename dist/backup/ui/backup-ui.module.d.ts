import { BackupUIController } from './backup-ui.controller';
import { BackupService } from '../backup.service';
export declare class BackupUIModule {
    static forRoot(): {
        module: typeof BackupUIModule;
        controllers: (typeof BackupUIController)[];
        providers: (typeof BackupService)[];
        exports: (typeof BackupService)[];
    };
}
