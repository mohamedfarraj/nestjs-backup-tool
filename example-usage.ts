import { Module } from '@nestjs/common';
import { BackupModule } from 'nestjs-backup-tool';

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
        { type: 'local', path: './backups' },
        {
          type: 's3',
          bucketName: 'my-backups',
          region: 'us-east-1',
          accessKeyId: 'YOUR_ACCESS_KEY',
          secretAccessKey: 'YOUR_SECRET_KEY',
        }
      ],
      schedule: '0 0 * * *', // Daily at midnight
      retentionDays: 7,
      enableUI: true,
    }),
  ],
})
export class AppModule {} 