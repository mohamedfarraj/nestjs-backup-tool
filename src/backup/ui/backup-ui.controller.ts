import { Controller, Get, Post, Delete, Body } from '@nestjs/common';
import { BackupService } from '../backup.service';

@Controller('backup-ui')
export class BackupUIController {
  constructor(private readonly backupService: BackupService) {}

  @Get('list')
  list() {
    return this.backupService.list();
  }

  @Post('create')
  create() {
    return this.backupService.createBackup();
  }

  @Post('restore')
  restore(@Body('fileName') fileName: string) {
    return this.backupService.restore(fileName);
  }

  @Delete('clean')
  clean() {
    return this.backupService.clean();
  }
} 