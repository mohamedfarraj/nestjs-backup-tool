import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BackupModule } from 'nestjs-backup-tool';

@Module({
  imports: [
    ConfigModule.forRoot(),
    BackupModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        database: {
          type: 'mysql',
          host: configService.get('DB_HOST'),
          user: configService.get('DB_USER'),
          password: configService.get('DB_PASSWORD'),
          database: configService.get('DB_NAME'),
        },
        storage: [
          {
            type: 's3',
            bucketName: configService.get('AWS_BUCKET'),
            region: configService.get('AWS_REGION'),
            accessKeyId: configService.get('AWS_ACCESS_KEY'),
            secretAccessKey: configService.get('AWS_SECRET_KEY'),
          }
        ],
        schedule: configService.get('BACKUP_SCHEDULE'),
        retentionDays: configService.get('BACKUP_RETENTION_DAYS'),
      }),
    }),
  ],
})
export class AppModule {} 