import { Module, DynamicModule } from '@nestjs/common';
import { BackupUIController } from './backup-ui.controller';
import { BackupService } from '../backup.service';
import { StorageFactory } from '../storage/storage.factory';
import { BACKUP_OPTIONS } from '../constants';
import { BackupOptions } from '../interfaces/backup-options.interface';

@Module({})
export class BackupUIModule {
  static forRoot(): DynamicModule {
    return {
      module: BackupUIModule,
      controllers: [BackupUIController],
      providers: [
        {
          provide: BACKUP_OPTIONS,
          useFactory: () => {
            // Get the options from the parent module
            const parentModule = process.mainModule?.require('./backup/backup.module');
            return parentModule?.options;
          },
        },
        StorageFactory,
        BackupService
      ],
      exports: [BackupService],
    };
  }
} 