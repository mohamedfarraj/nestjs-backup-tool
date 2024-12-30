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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorage = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs/promises");
const path = require("path");
let LocalStorage = class LocalStorage {
    constructor(config) {
        this.config = config;
        fs.mkdir(config.path, { recursive: true });
    }
    async save(filePath, fileName) {
        const destinationPath = path.join(this.config.path, fileName);
        await fs.copyFile(filePath, destinationPath);
    }
    async get(fileName) {
        const filePath = path.join(this.config.path, fileName);
        return fs.readFile(filePath);
    }
    async delete(fileName) {
        const filePath = path.join(this.config.path, fileName);
        await fs.unlink(filePath);
    }
    async list() {
        return fs.readdir(this.config.path);
    }
};
LocalStorage = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], LocalStorage);
exports.LocalStorage = LocalStorage;
//# sourceMappingURL=local.storage.js.map