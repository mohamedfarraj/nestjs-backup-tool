"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BackupModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const backup_service_1 = require("./backup.service");
const constants_1 = require("./constants");
const backup_ui_module_1 = require("./ui/backup-ui.module");
const storage_factory_1 = require("./storage/storage.factory");
let BackupModule = BackupModule_1 = class BackupModule {
    static forRoot(options) {
        const providers = [
            {
                provide: constants_1.BACKUP_OPTIONS,
                useValue: options,
            },
            storage_factory_1.StorageFactory,
            backup_service_1.BackupService,
        ];
        const imports = [schedule_1.ScheduleModule.forRoot()];
        if (options.enableUI) {
            imports.push(backup_ui_module_1.BackupUIModule.forRoot(options));
        }
        return {
            module: BackupModule_1,
            imports,
            providers,
            exports: [backup_service_1.BackupService, storage_factory_1.StorageFactory, constants_1.BACKUP_OPTIONS],
            global: true,
        };
    }
    static forRootAsync(options) {
        const providers = [
            {
                provide: constants_1.BACKUP_OPTIONS,
                useFactory: options.useFactory,
                inject: options.inject || [],
            },
            storage_factory_1.StorageFactory,
            backup_service_1.BackupService,
        ];
        const imports = [
            schedule_1.ScheduleModule.forRoot(),
            ...(options.imports || []),
        ];
        return {
            module: BackupModule_1,
            imports,
            providers,
            exports: [backup_service_1.BackupService, storage_factory_1.StorageFactory, constants_1.BACKUP_OPTIONS],
            global: true,
        };
    }
};
BackupModule = BackupModule_1 = __decorate([
    (0, common_1.Module)({})
], BackupModule);
exports.BackupModule = BackupModule;
//# sourceMappingURL=backup.module.js.map