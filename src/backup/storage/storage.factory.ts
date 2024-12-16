import { Injectable } from '@nestjs/common';
import { StorageConfig } from '../interfaces/backup-options.interface';
import { Storage } from './storage.interface';
import { LocalStorage } from './local.storage';
import { FTPStorage } from './ftp.storage';
import { S3Storage } from './s3.storage';

@Injectable()
export class StorageFactory {
  createStorage(config: StorageConfig): Storage {
    switch (config.type) {
      case 'local':
        return new LocalStorage(config);
      case 'ftp':
        return new FTPStorage(config);
      case 's3':
        return new S3Storage(config);
      default:
        throw new Error(`Unsupported storage type: ${(config as any).type}`);
    }
  }
} 