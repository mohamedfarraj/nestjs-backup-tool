export type DatabaseType = 'mysql' | 'postgres';
export type StorageType = 'local' | 'ftp' | 's3';

export interface DatabaseConfig {
  type: DatabaseType;
  host: string;
  port?: number;
  user: string;
  password: string;
  database: string;
}

export interface LocalStorageConfig {
  type: 'local';
  path: string;
}

export interface FTPStorageConfig {
  type: 'ftp';
  host: string;
  user: string;
  password: string;
  port?: number;
}

export interface S3StorageConfig {
  type: 's3';
  bucketName: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export type StorageConfig = LocalStorageConfig | FTPStorageConfig | S3StorageConfig;

export interface BackupOptions {
  database: DatabaseConfig;
  storage: StorageConfig[];
  schedule?: string;
  retentionDays?: number;
  enableUI?: boolean;
  notifications?: {
    email?: {
      from: string;
      to: string[];
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        auth: {
          user: string;
          pass: string;
        };
      };
    };
  };
} 