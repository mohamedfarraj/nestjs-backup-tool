import { DynamicModule } from '@nestjs/common';
import { BackupOptions } from '../interfaces/backup-options.interface';
export declare class BackupUIModule {
    static forRoot(options: BackupOptions): DynamicModule;
}
