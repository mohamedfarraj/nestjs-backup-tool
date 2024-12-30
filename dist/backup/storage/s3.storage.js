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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var S3Storage_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Storage = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const fs = require("fs/promises");
let S3Storage = S3Storage_1 = class S3Storage {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(S3Storage_1.name);
        this.s3Client = new client_s3_1.S3Client({
            region: config.region,
            credentials: {
                accessKeyId: config.accessKeyId,
                secretAccessKey: config.secretAccessKey,
            },
        });
    }
    async save(filePath, fileName) {
        const fileContent = await fs.readFile(filePath);
        await this.s3Client.send(new client_s3_1.PutObjectCommand({
            Bucket: this.config.bucketName,
            Key: fileName,
            Body: fileContent,
        }));
    }
    async get(fileName) {
        var _a, e_1, _b, _c;
        const response = await this.s3Client.send(new client_s3_1.GetObjectCommand({
            Bucket: this.config.bucketName,
            Key: fileName,
        }));
        const chunks = [];
        try {
            for (var _d = true, _e = __asyncValues(response.Body), _f; _f = await _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const chunk = _c;
                    chunks.push(chunk);
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return Buffer.concat(chunks);
    }
    async delete(fileName) {
        await this.s3Client.send(new client_s3_1.DeleteObjectCommand({
            Bucket: this.config.bucketName,
            Key: fileName,
        }));
    }
    async list() {
        const response = await this.s3Client.send(new client_s3_1.ListObjectsCommand({
            Bucket: this.config.bucketName,
        }));
        return (response.Contents || []).map(item => item.Key).filter((key) => !!key);
    }
};
S3Storage = S3Storage_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object])
], S3Storage);
exports.S3Storage = S3Storage;
//# sourceMappingURL=s3.storage.js.map