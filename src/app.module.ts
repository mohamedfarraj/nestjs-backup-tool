import { Module } from '@nestjs/common';
import { BackupModule } from './backup/backup.module';

@Module({
  imports: [
    BackupModule.forRoot({
      database: {
        type: 'mysql',
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'test_db',
      },
      storage: [
        { type: 'local', path: './backups' }
      ],
      schedule: '0 0 * * *',
      retentionDays: 7,
      enableUI: true,
    }),
  ],
})
export class AppModule {} 