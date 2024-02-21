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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppConfigurationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const configuration_entity_1 = require("../../entity/configuration.entity");
let AppConfigurationService = class AppConfigurationService {
    constructor(appConfigurationRepository) {
        this.appConfigurationRepository = appConfigurationRepository;
    }
    async findConfigurations() {
        try {
            return await this.appConfigurationRepository.find();
        }
        catch (err) {
            console.log("error in configuration listing", err);
        }
    }
    async getConfigById(id) {
        try {
            return await this.appConfigurationRepository.findOne({
                where: {
                    id: id
                }
            });
        }
        catch (err) {
            console.log("error while finding config record", err);
        }
    }
    async updateRecord(record, requestedData) {
        try {
            record.latestAppVersion = requestedData.latestAppVersion;
            record.isForcefullyUpdateNeeded = requestedData.forceUpdate == "1" ? true : false;
            console.log({ record }, { requestedData });
            return await this.appConfigurationRepository.save(record);
        }
        catch (err) {
            console.log("error while updating config", err);
            throw new common_1.NotFoundException('Configuration updation Error');
        }
    }
};
AppConfigurationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(configuration_entity_1.AppConfiguration)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AppConfigurationService);
exports.AppConfigurationService = AppConfigurationService;
//# sourceMappingURL=app-configuration.service.js.map