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
var FTPStorage_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FTPStorage = void 0;
const common_1 = require("@nestjs/common");
const Client = require("ftp");
const fs = require("fs");
let FTPStorage = FTPStorage_1 = class FTPStorage {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(FTPStorage_1.name);
        this.client = new Client();
        this.client.connect({
            host: config.host,
            user: config.user,
            password: config.password,
            port: config.port || 21,
        });
    }
    async save(filePath, fileName) {
        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(filePath);
            this.client.put(readStream, fileName, (err) => {
                if (err)
                    reject(err);
                resolve();
            });
        });
    }
    async get(fileName) {
        return new Promise((resolve, reject) => {
            this.client.get(fileName, (err, stream) => {
                if (err)
                    reject(err);
                const chunks = [];
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', () => resolve(Buffer.concat(chunks)));
                stream.on('error', (err) => reject(err));
            });
        });
    }
    async delete(fileName) {
        return new Promise((resolve, reject) => {
            this.client.delete(fileName, (err) => {
                if (err)
                    reject(err);
                resolve();
            });
        });
    }
    async list() {
        return new Promise((resolve, reject) => {
            this.client.list((err, list) => {
                if (err)
                    reject(err);
                resolve(list.map(item => item.name));
            });
        });
    }
};
FTPStorage = FTPStorage_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], FTPStorage);
exports.FTPStorage = FTPStorage;
//# sourceMappingURL=ftp.storage.js.map