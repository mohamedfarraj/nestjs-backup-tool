"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BackupUIModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupUIModule = void 0;
const common_1 = require("@nestjs/common");
const backup_ui_controller_1 = require("./backup-ui.controller");
const backup_service_1 = require("../backup.service");
const storage_factory_1 = require("../storage/storage.factory");
const constants_1 = require("../constants");
let BackupUIModule = BackupUIModule_1 = class BackupUIModule {
    static forRoot() {
        return {
            module: BackupUIModule_1,
            controllers: [backup_ui_controller_1.BackupUIController],
            providers: [
                {
                    provide: constants_1.BACKUP_OPTIONS,
                    useFactory: () => {
                        var _a;
                        const parentModule = (_a = process.mainModule) === null || _a === void 0 ? void 0 : _a.require('./backup/backup.module');
                        return parentModule === null || parentModule === void 0 ? void 0 : parentModule.options;
                    },
                },
                storage_factory_1.StorageFactory,
                backup_service_1.BackupService
            ],
            exports: [backup_service_1.BackupService],
        };
    }
};
BackupUIModule = BackupUIModule_1 = __decorate([
    (0, common_1.Module)({})
], BackupUIModule);
exports.BackupUIModule = BackupUIModule;
//# sourceMappingURL=backup-ui.module.js.map