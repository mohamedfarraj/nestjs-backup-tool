"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const cron_1 = require("cron");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = require("fs/promises");
const path = require("path");
const constants_1 = require("./constants");
const storage_factory_1 = require("./storage/storage.factory");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
let BackupService = BackupService_1 = class BackupService {
    constructor(options, storageFactory, schedulerRegistry) {
        this.options = options;
        this.storageFactory = storageFactory;
        this.schedulerRegistry = schedulerRegistry;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.tempDir = path.join(process.cwd(), 'temp-backups');
        this.BACKUP_JOB_NAME = 'backup-job';
        fs.mkdir(this.tempDir, { recursive: true });
    }
    async onModuleInit() {
        if (this.options.schedule) {
            try {
                try {
                    const existingJob = this.schedulerRegistry.getCronJob(this.BACKUP_JOB_NAME);
                    if (existingJob) {
                        this.logger.log(`Stopping existing backup job`);
                        existingJob.stop();
                        this.schedulerRegistry.deleteCronJob(this.BACKUP_JOB_NAME);
                    }
                }
                catch (error) {
                    this.logger.debug('No existing backup job found');
                }
                const job = new cron_1.CronJob(this.options.schedule, async () => {
                    try {
                        await this.createBackup();
                        this.logger.log('Scheduled backup completed successfully');
                    }
                    catch (error) {
                        this.logger.error('Scheduled backup failed', error);
                        await this.sendNotification('Backup Failed', error.message);
                    }
                }, null, true, 'UTC');
                this.schedulerRegistry.addCronJob(this.BACKUP_JOB_NAME, job);
                this.logger.log(`Backup scheduled with cron expression: ${this.options.schedule}`);
            }
            catch (error) {
                this.logger.error('Failed to schedule backup job', error);
            }
        }
    }
    async onModuleDestroy() {
        try {
            const job = this.schedulerRegistry.getCronJob(this.BACKUP_JOB_NAME);
            if (job) {
                job.stop();
                this.schedulerRegistry.deleteCronJob(this.BACKUP_JOB_NAME);
                this.logger.log('Backup job stopped and removed');
            }
        }
        catch (error) {
            this.logger.error('Error cleaning up backup job', error);
        }
    }
    async createBackup() {
        try {
            await this.checkDatabaseTools();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const fileName = `backup-${timestamp}.sql`;
            const filePath = path.join(this.tempDir, fileName);
            await this.createDatabaseDump(filePath);
            this.logger.log(`Database dump created at ${filePath}`);
            for (const storageConfig of this.options.storage) {
                const storage = this.storageFactory.createStorage(storageConfig);
                await storage.save(filePath, fileName);
                this.logger.log(`Backup saved to ${storageConfig.type} storage`);
            }
            await fs.unlink(filePath);
            await this.sendNotification('Backup Success', `Backup ${fileName} created successfully`);
            await this.clean();
        }
        catch (error) {
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
    async restore(fileName) {
        const tempFilePath = path.join(this.tempDir, fileName);
        try {
            let restored = false;
            for (const storageConfig of this.options.storage) {
                try {
                    const storage = this.storageFactory.createStorage(storageConfig);
                    const fileContent = await storage.get(fileName);
                    await fs.writeFile(tempFilePath, fileContent);
                    restored = true;
                    break;
                }
                catch (error) {
                    this.logger.warn(`Failed to get backup from ${storageConfig.type} storage`, error);
                }
            }
            if (!restored) {
                throw new Error('Could not retrieve backup file from any storage location');
            }
            await this.restoreDatabase(tempFilePath);
            this.logger.log(`Database restored from ${fileName}`);
            await this.sendNotification('Restore Success', `Database restored from ${fileName}`);
        }
        catch (error) {
            this.logger.error('Restore failed', error);
            await this.sendNotification('Restore Failed', error.message);
            throw error;
        }
        finally {
            try {
                await fs.unlink(tempFilePath);
            }
            catch (error) {
                this.logger.warn('Failed to clean up temp file', error);
            }
        }
    }
    async list() {
        for (const storageConfig of this.options.storage) {
            try {
                const storage = this.storageFactory.createStorage(storageConfig);
                return await storage.list();
            }
            catch (error) {
                this.logger.warn(`Failed to list backups from ${storageConfig.type} storage`, error);
            }
        }
        return [];
    }
    async clean() {
        if (!this.options.retentionDays)
            return;
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
                    }
                    catch (error) {
                        this.logger.warn(`Failed to delete file ${file}`, error);
                    }
                }
            }
            catch (error) {
                this.logger.warn(`Failed to clean backups from ${storageConfig.type} storage`, error);
            }
        }
    }
    async createDatabaseDump(filePath) {
        const { type, host, port, user, password, database } = this.options.database;
        let command;
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
        }
        else if (type === 'postgres') {
            const env = Object.assign({ PGPASSWORD: password }, process.env);
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
        }
        else {
            throw new Error(`Unsupported database type: ${type}`);
        }
        await execAsync(command);
    }
    async restoreDatabase(filePath) {
        const { type, host, port, user, password, database } = this.options.database;
        let command;
        if (type === 'mysql') {
            command = `mysql -h${host} ${port ? `-P${port}` : ''} -u${user} -p${password} ${database} < ${filePath}`;
        }
        else if (type === 'postgres') {
            const env = Object.assign({ PGPASSWORD: password }, process.env);
            command = `psql -h ${host} ${port ? `-p ${port}` : ''} -U ${user} -d ${database} -f ${filePath}`;
            await execAsync(command, { env });
            return;
        }
        else {
            throw new Error(`Unsupported database type: ${type}`);
        }
        await execAsync(command);
    }
    extractTimestampFromFileName(fileName) {
        const match = fileName.match(/backup-(.+)\.sql$/);
        if (!match)
            return null;
        const timestamp = match[1].replace(/-/g, ':');
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? null : date;
    }
    async sendNotification(subject, message) {
        var _a;
        if (!((_a = this.options.notifications) === null || _a === void 0 ? void 0 : _a.email))
            return;
        this.logger.log(`Notification: ${subject} - ${message}`);
    }
    async checkDatabaseTools() {
        const { type } = this.options.database;
        try {
            if (type === 'mysql') {
                await execAsync('which mysqldump');
            }
            else if (type === 'postgres') {
                await execAsync('which pg_dump');
            }
        }
        catch (error) {
            const tool = type === 'mysql' ? 'mysqldump' : 'pg_dump';
            throw new Error(`${tool} is not installed. Please install the required database tools:\n` +
                `For MySQL: Install mysql-client\n` +
                `For PostgreSQL: Install postgresql-client`);
        }
    }
};
BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(constants_1.BACKUP_OPTIONS)),
    __metadata("design:paramtypes", [Object, storage_factory_1.StorageFactory,
        schedule_1.SchedulerRegistry])
], BackupService);
exports.BackupService = BackupService;
//# sourceMappingURL=backup.service.js.map