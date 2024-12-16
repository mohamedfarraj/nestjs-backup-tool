# nestjs-backup-tool

A comprehensive backup solution for NestJS applications supporting multiple databases and storage methods.

## Features


- 🗄️ **Multiple Database Support**
  - MySQL
  - PostgreSQL

- 📦 **Multiple Storage Options**
  - Local File System
  - FTP Server
  - Amazon S3

- ⚙️ **Advanced Features**
  - Scheduled backups using cron expressions
  - Configurable retention policy
  - Optional web UI for backup management
  - Email notifications
  - Async configuration support


## Installation

```bash
npm install nestjs-backup-tool
```

## Usage

### Basic Configuration

```typescript
import { Module } from '@nestjs/common';
import { BackupModule } from 'nestjs-backup-tool';

@Module({
  imports: [
    BackupModule.register({
      database: {
        type: 'mysql',
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'mydb'
      },
      storage: [
        { type: 'local', local: { path: './backups' } },
        { 
          type: 's3', 
          s3: { 
            bucketName: 'my-backup-bucket', 
            region: 'us-east-1',
            accessKeyId: 'AWS_ACCESS_KEY',
            secretAccessKey: 'AWS_SECRET_KEY'
          } 
        }
      ],
      schedule: '0 2 * * *', // Daily at 2 AM
      retentionDays: 30,
      enableUI: true,
      notifications: {
        enabled: true,
        email: {
          from: 'backup@example.com',
          to: 'admin@example.com',
          smtp: {
            host: 'smtp.example.com',
            port: 587,
            auth: {
              user: 'smtp-user',
              pass: 'smtp-password'
            }
          }
        }
      }
    }),
  ],
})
export class AppModule {}
```

## Configuration Options

### Database Configuration
- `type`: 'mysql' or 'postgres'
- `host`: Database host
- `user`: Database username
- `password`: Database password
- `database`: Database name

### Storage Options
- Local Storage
  - `type: 'local'`
  - `path`: Local directory path
- FTP Storage
  - `type: 'ftp'`
  - `host`, `user`, `password`, `port`
- S3 Storage
  - `type: 's3'`
  - `bucketName`, `region`, `accessKeyId`, `secretAccessKey`

### Scheduling
- `schedule`: Cron expression for backup timing

### Retention
- `retentionDays`: Number of days to keep backups

### UI and Notifications
- `enableUI`: Enable backup management UI
- `notifications`: Configure email notifications

## API Endpoints (when UI is enabled)
- `POST /backup-ui/create`: Create a new backup
- `GET /backup-ui/list`: List all backups
- `POST /backup-ui/restore`: Restore a backup
- `DELETE /backup-ui/clean`: Clean old backups


### System Requirements
- Node.js >= 14.x
- NestJS >= 8.x

### Database CLI Tools
- For MySQL backups: `mysqldump` CLI tool must be installed
- For PostgreSQL backups: `pg_dump` CLI tool must be installed

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created and maintained by [Mohamed Farraj](https://github.com/mohamedfarraj)

## Support

If you have any questions, issues, or feature requests, please:

1. Check the [GitHub Issues](https://github.com/mohamedfarraj/nestjs-backup-tool/issues)
2. Open a new issue if your problem or suggestion is not already reported
3. Join our [Discord Community](https://discord.gg/your-discord) for real-time support

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes.

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Built with [NestJS](https://nestjs.com/)