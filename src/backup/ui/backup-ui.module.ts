import { Module } from '@nestjs/common';
import { BackupUIController } from './backup-ui.controller';

@Module({
  controllers: [BackupUIController],
})
export class BackupUIModule {} 