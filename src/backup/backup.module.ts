import { DynamicModule, Module, Provider } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupService } from './backup.service';
import { BackupOptions } from './interfaces/backup-options.interface';
import { BACKUP_OPTIONS } from './constants';
import { BackupUIModule } from './ui/backup-ui.module';
import { StorageFactory } from './storage/storage.factory';

@Module({})
export class BackupModule {
  static options: BackupOptions;

  static forRoot(options: BackupOptions): DynamicModule {
    BackupModule.options = options;

    const providers: Provider[] = [
      {
        provide: BACKUP_OPTIONS,
        useValue: options,
      },
      StorageFactory,
      BackupService,
    ];

    const imports = [ScheduleModule.forRoot()];
    
    if (options.enableUI) {
      imports.push(BackupUIModule.forRoot());
    }

    return {
      module: BackupModule,
      imports,
      providers,
      exports: [BackupService, StorageFactory, BACKUP_OPTIONS],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<BackupOptions> | BackupOptions;
    inject?: any[];
    imports?: any[];
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: BACKUP_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      StorageFactory,
      BackupService,
    ];

    const imports = [
      ScheduleModule.forRoot(),
      ...(options.imports || []),
    ];

    return {
      module: BackupModule,
      imports,
      providers,
      exports: [BackupService, StorageFactory, BACKUP_OPTIONS],
      global: true,
    };
  }
} 