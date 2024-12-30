import { Module } from '@nestjs/common';
import { BackupUIController } from './backup-ui.controller';
import { BackupService } from '../backup.service';

@Module({
  controllers: [BackupUIController],
  providers: [BackupService],
  exports: [BackupService],
})
export class BackupUIModule {
  static forRoot() {
    return {
      module: BackupUIModule,
      controllers: [BackupUIController],
      providers: [BackupService],
      exports: [BackupService],
    };
  }
} 