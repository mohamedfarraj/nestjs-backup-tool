import { DynamicModule } from '@nestjs/common';
import { BackupOptions } from './interfaces/backup-options.interface';
export declare class BackupModule {
    static options: BackupOptions;
    static forRoot(options: BackupOptions): DynamicModule;
    static forRootAsync(options: {
        useFactory: (...args: any[]) => Promise<BackupOptions> | BackupOptions;
        inject?: any[];
        imports?: any[];
    }): DynamicModule;
}
