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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const setting_entity_1 = require("../entity/setting.entity");
const typeorm_2 = require("typeorm");
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const user_entity_1 = require("../entity/user.entity");
let SettingService = class SettingService {
    constructor(settingRespository, userRepository) {
        this.settingRespository = settingRespository;
        this.userRepository = userRepository;
    }
    createSettingRecord(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            var _a, _b, _c;
            try {
                let settingObj, tzForUser, start24TimeInHrMn, end24TimeInHrMn;
                const settingObjDetail = await this.settingRespository.findOne({
                    where: {
                        userId: loginUser.sub
                    }
                });
                if (!settingObjDetail || settingObjDetail == null) {
                    settingObj = new setting_entity_1.Setting();
                }
                else {
                    settingObj = settingObjDetail;
                }
                settingObj.sleepStartTime = (_a = req.sleepStartTime) !== null && _a !== void 0 ? _a : settingObj.sleepStartTime;
                settingObj.userId = loginUser.sub;
                settingObj.type = "notificationSetting";
                settingObj.sleepEndTime = (_b = req.sleepEndTime) !== null && _b !== void 0 ? _b : settingObj.sleepEndTime;
                settingObj.checkinTime = (_c = req.checkinTime) !== null && _c !== void 0 ? _c : settingObj.checkinTime;
                var st = req.sleepStartTime.split(" ");
                var et = req.sleepEndTime.split(" ");
                settingObj.sleepStartTimeIn24Format = st[0];
                settingObj.sleepEndTimeIn24Format = et[0];
                if (req.checkinTime != 30) {
                    settingObj.checkinTimeInMinutes = req.checkinTime * 60;
                }
                else {
                    settingObj.checkinTimeInMinutes = 30;
                }
                const userObj = await this.userRepository.findOne({
                    where: {
                        id: loginUser.sub
                    }
                });
                let sdateTime = (0, moment_1.default)(req.sleepStartTime, 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');
                let edateTime = (0, moment_1.default)(req.sleepEndTime, 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');
                console.log({ sdateTime }, { edateTime });
                if (userObj.userTimezone) {
                    let combineTz;
                    let statictime = "-06:00";
                    if (userObj.userTimezone.indexOf("-") != -1) {
                        combineTz = userObj.userTimezone.split("-");
                        combineTz[1] = `+${combineTz[1]}`;
                    }
                    else {
                        combineTz = userObj.userTimezone.split("+");
                        combineTz[1] = `-${combineTz[1]}`;
                    }
                    if (combineTz[1]) {
                        start24TimeInHrMn = (0, moment_1.default)(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
                        end24TimeInHrMn = (0, moment_1.default)(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
                    }
                    else {
                        start24TimeInHrMn = ((0, moment_1.default)(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
                        end24TimeInHrMn = ((0, moment_1.default)(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
                    }
                }
                else {
                    let statictime = "-06:00";
                    start24TimeInHrMn = ((0, moment_1.default)(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
                    end24TimeInHrMn = ((0, moment_1.default)(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime)).format('HH:mm:ss');
                }
                settingObj.sleepStartTimeIn24Format = start24TimeInHrMn;
                settingObj.sleepEndTimeIn24Format = end24TimeInHrMn;
                let record = await this.settingRespository.save(settingObj);
                resolve({
                    status: true,
                    message: `Setting saved successfully!!`,
                    result: record
                });
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        });
    }
    getCheckinLIst(req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                let record = [
                    { "checkinTime": "1" },
                    { "checkinTime": "2" },
                    { "checkinTime": "6" },
                    { "checkinTime": "12" },
                    { "checkinTime": "24" }
                ];
                resolve({
                    status: true,
                    message: `List Fetched successfully!!`,
                    result: record
                });
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        });
    }
};
SettingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SettingService);
exports.SettingService = SettingService;
//# sourceMappingURL=setting.service.js.map