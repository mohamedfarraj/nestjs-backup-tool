import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BackupOptions, DatabaseConfig } from './interfaces/backup-options.interface';
import { BACKUP_OPTIONS } from './constants';
import { StorageFactory } from './storage/storage.factory';

const execAsync = promisify(exec);

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly tempDir = path.join(process.cwd(), 'temp-backups');

  constructor(
    @Inject(BACKUP_OPTIONS) private readonly options: BackupOptions,
    private readonly storageFactory: StorageFactory,
  ) {
    // Create temp directory if it doesn't exist
    fs.mkdir(this.tempDir, { recursive: true });
  }

  @Cron('0 0 * * *') // Default daily at midnight
  async scheduledBackup() {
    if (this.options.schedule) {
      try {
        await this.createBackup();
        this.logger.log('Scheduled backup completed successfully');
      } catch (error) {
        this.logger.error('Scheduled backup failed', error);
        await this.sendNotification('Backup Failed', error.message);
      }
    }
  }

  async createBackup(): Promise<void> {
    try {
      await this.checkDatabaseTools();
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `backup-${timestamp}.sql`;
      const filePath = path.join(this.tempDir, fileName);

      // Create database dump
      await this.createDatabaseDump(filePath);
      this.logger.log(`Database dump created at ${filePath}`);

      // Upload to all configured storage locations
      for (const storageConfig of this.options.storage) {
        const storage = this.storageFactory.createStorage(storageConfig);
        await storage.save(filePath, fileName);
        this.logger.log(`Backup saved to ${storageConfig.type} storage`);
      }

      // Clean up temp file
      await fs.unlink(filePath);
      
      await this.sendNotification('Backup Success', `Backup ${fileName} created successfully`);
      await this.clean(); // Clean old backups based on retention policy
    } catch (error) {
      const errorMessage = error.message.includes('not installed')
        ? error.message
        : `Backup failed: ${error.message}\n` +
          `Please ensure:\n` +
          `1. Database tools are installed\n` +
          `2. Database credentials are correct\n` +
          `3. Database is accessible from this machine`;
      
      this.logger.error(errorMessage);
      await this.sendNotification('Backup Failed', errorMessage);
      throw new Error(errorMessage);
    }
  }

  async restore(fileName: string): Promise<void> {
    const tempFilePath = path.join(this.tempDir, fileName);

    try {
      // Get the file from the first available storage
      let restored = false;
      for (const storageConfig of this.options.storage) {
        try {
          const storage = this.storageFactory.createStorage(storageConfig);
          const fileContent = await storage.get(fileName);
          await fs.writeFile(tempFilePath, fileContent);
          restored = true;
          break;
        } catch (error) {
          this.logger.warn(`Failed to get backup from ${storageConfig.type} storage`, error);
        }
      }

      if (!restored) {
        throw new Error('Could not retrieve backup file from any storage location');
      }

      // Restore the database
      await this.restoreDatabase(tempFilePath);
      this.logger.log(`Database restored from ${fileName}`);
      
      await this.sendNotification('Restore Success', `Database restored from ${fileName}`);
    } catch (error) {
      this.logger.error('Restore failed', error);
      await this.sendNotification('Restore Failed', error.message);
      throw error;
    } finally {
      // Clean up temp file
      try {
        await fs.unlink(tempFilePath);
      } catch (error) {
        this.logger.warn('Failed to clean up temp file', error);
      }
    }
  }

  async list(): Promise<string[]> {
    // Get list from first available storage
    for (const storageConfig of this.options.storage) {
      try {
        const storage = this.storageFactory.createStorage(storageConfig);
        return await storage.list();
      } catch (error) {
        this.logger.warn(`Failed to list backups from ${storageConfig.type} storage`, error);
      }
    }
    return [];
  }

  async clean(): Promise<void> {
    if (!this.options.retentionDays) return;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.options.retentionDays);

    for (const storageConfig of this.options.storage) {
      try {
        const storage = this.storageFactory.createStorage(storageConfig);
        const files = await storage.list();

        for (const file of files) {
          try {
            const timestamp = this.extractTimestampFromFileName(file);
            if (timestamp && timestamp < cutoffDate) {
              await storage.delete(file);
              this.logger.log(`Deleted old backup: ${file}`);
            }
          } catch (error) {
            this.logger.warn(`Failed to delete file ${file}`, error);
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to clean backups from ${storageConfig.type} storage`, error);
      }
    }
  }

  private async createDatabaseDump(filePath: string): Promise<void> {
    const { type, host, port, user, password, database } = this.options.database;
    let command: string;

    if (type === 'mysql') {
      command = [
        'mysqldump',
        `-h${host}`,
        port ? `-P${port}` : '',
        `-u${user}`,
        `-p${password}`,
        '--single-transaction',
        '--quick',
        '--compress',
        database,
        `> "${filePath}"`
      ].filter(Boolean).join(' ');
    } else if (type === 'postgres') {
      const env = {
        PGPASSWORD: password,
        ...process.env,
      };
      command = [
        'pg_dump',
        `-h ${host}`,
        port ? `-p ${port}` : '',
        `-U ${user}`,
        `-d ${database}`,
        `-f "${filePath}"`,
        '--clean',
        '--if-exists'
      ].filter(Boolean).join(' ');
      await execAsync(command, { env });
      return;
    } else {
      throw new Error(`Unsupported database type: ${type}`);
    }

    await execAsync(command);
  }

  private async restoreDatabase(filePath: string): Promise<void> {
    const { type, host, port, user, password, database } = this.options.database;
    let command: string;

    if (type === 'mysql') {
      command = `mysql -h${host} ${port ? `-P${port}` : ''} -u${user} -p${password} ${database} < ${filePath}`;
    } else if (type === 'postgres') {
      const env = {
        PGPASSWORD: password,
        ...process.env,
      };
      command = `psql -h ${host} ${port ? `-p ${port}` : ''} -U ${user} -d ${database} -f ${filePath}`;
      await execAsync(command, { env });
      return;
    } else {
      throw new Error(`Unsupported database type: ${type}`);
    }

    await execAsync(command);
  }

  private extractTimestampFromFileName(fileName: string): Date | null {
    const match = fileName.match(/backup-(.+)\.sql$/);
    if (!match) return null;
    
    const timestamp = match[1].replace(/-/g, ':');
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? null : date;
  }

  private async sendNotification(subject: string, message: string): Promise<void> {
    if (!this.options.notifications?.email) return;

    // Implement email notification logic here
    // You can use nodemailer or any other email service
    this.logger.log(`Notification: ${subject} - ${message}`);
  }

  private async checkDatabaseTools(): Promise<void> {
    const { type } = this.options.database;
    
    try {
      if (type === 'mysql') {
        await execAsync('which mysqldump');
      } else if (type === 'postgres') {
        await execAsync('which pg_dump');
      }
    } catch (error) {
      const tool = type === 'mysql' ? 'mysqldump' : 'pg_dump';
      throw new Error(
        `${tool} is not installed. Please install the required database tools:\n` +
        `For MySQL: Install mysql-client\n` +
        `For PostgreSQL: Install postgresql-client`
      );
    }
  }
} 