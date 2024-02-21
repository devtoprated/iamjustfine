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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const user_entity_1 = require("../entity/user.entity");
const otp_entity_1 = require("../entity/otp.entity");
const setting_entity_1 = require("../entity/setting.entity");
let env = require("dotenv").config();
const moment_1 = __importDefault(require("moment"));
require("moment-timezone");
const user_token_entity_1 = require("../entity/user-token.entity");
const notification_service_1 = require("../notification/notification.service");
const notification_log_entity_1 = require("../entity/notification-log.entity");
const { Vonage } = require('@vonage/server-sdk');
const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});
let AuthService = class AuthService {
    constructor(jwtService, notificationService, userRepository, otpRepository, settingRepository, userTokenRepository, notificationLogRepository) {
        this.jwtService = jwtService;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.settingRepository = settingRepository;
        this.userTokenRepository = userTokenRepository;
        this.notificationLogRepository = notificationLogRepository;
    }
    async login(req) {
        return new Promise(async (resolve, reject) => {
            try {
                const { name, dialCode, contactNumber, deviceType, deviceToken, userTimezone, isDuplicateLogin } = req;
                let oldDeviceToken;
                let exists = await this.userRepository.findOne({
                    where: {
                        name: (0, typeorm_1.Like)(`${name.trim()}`),
                        dialCode: dialCode,
                        contactNumber: contactNumber
                    }
                });
                console.log({ exists });
                if (exists) {
                    oldDeviceToken = exists.deviceToken;
                    exists.deviceType = deviceType;
                    exists.deviceToken = deviceToken;
                    exists.userTimezone = userTimezone;
                    await this.userRepository.save(exists);
                    let otp = await this.generateOtp(exists.id);
                    {
                        if (isDuplicateLogin) {
                            let fromUser = {
                                "isSystemNotification": true,
                                "name": "Admin",
                                "picture": "",
                                "fullContactNumber": ""
                            };
                            let pushNotificationPayload = {
                                fromUserObj: fromUser,
                                toUserObj: [oldDeviceToken],
                                notificationTitle: "New Device Login Request",
                                message: "A new device login using your credentials.",
                                completeObject: fromUser,
                                isMultiNotifications: true,
                                notificationType: "new_device_login",
                                moduleName: '',
                            };
                            this.notificationService.sendPushNotifications(pushNotificationPayload, deviceType);
                            {
                                try {
                                    const notifObj = {
                                        toUserId: exists.id,
                                        message: "A new device login using your credentials.",
                                        type: 'request_accepted',
                                        title: "New Device Login Request",
                                        moduleName: ''
                                    };
                                    this.notificationService.normalNotification(notifObj);
                                }
                                catch (err) {
                                    console.log("error login logs", err);
                                }
                            }
                        }
                    }
                    resolve({
                        status: true,
                        message: "Confirmation code sent successfully.",
                        result: exists
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: "Invalid Credentials.",
                        result: {}
                    });
                }
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...',
                });
            }
        });
    }
    async register(req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                const { name, contactNumber, email, password, dialCode, deviceType, deviceToken, userTimezone } = req;
                let exists = await this.existsBycontactNumber(contactNumber, dialCode);
                if (!exists) {
                    let user = new user_entity_1.Users();
                    user.contactNumber = contactNumber;
                    user.name = name.trim();
                    user.dialCode = dialCode;
                    user.deviceType = deviceType;
                    user.deviceToken = deviceToken;
                    user.isVerified = false;
                    user.userTimezone = userTimezone;
                    user.lastCheckin = new Date();
                    let saveUser = await this.userRepository.save(user);
                    if (saveUser) {
                        let twilioDetail = await this.generateOtp(saveUser.id);
                        {
                            let staticObj = {
                                "type": "notificationSetting",
                                "checkinTime": "24"
                            };
                            await this.createDefaultSettingRecord(staticObj, saveUser);
                        }
                        if (twilioDetail.status == false) {
                            this.userRepository.delete({
                                id: saveUser.id
                            });
                            resolve(twilioDetail);
                        }
                        else {
                            resolve({
                                status: true,
                                message: "Confirmation code sent successfully.",
                                result: saveUser
                            });
                        }
                    }
                }
                else {
                    if (exists.isVerified == false) {
                        let twilioDetail = await this.generateOtp(exists.id);
                        if (twilioDetail.status == false) {
                            resolve(twilioDetail);
                        }
                        else {
                            resolve({
                                status: true,
                                message: "Confirmation code sent successfully.",
                                result: exists
                            });
                        }
                    }
                    else {
                        resolve({
                            status: false,
                            message: "Account already exists.",
                            result: {}
                        });
                    }
                }
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
    async existsBycontactNumber(contactNumber, dialCode, needVerified = false) {
        if (needVerified) {
            var isUserExists = await this.userRepository.findOne({
                relations: {
                    otp: true,
                },
                where: [
                    {
                        contactNumber: contactNumber,
                        dialCode: dialCode,
                        isVerified: true
                    },
                ],
            });
        }
        else {
            var isUserExists = await this.userRepository.findOne({
                relations: {
                    otp: true,
                },
                where: [
                    {
                        contactNumber: contactNumber,
                        dialCode: dialCode,
                    },
                ],
            });
        }
        return isUserExists;
    }
    async generateOtp(userId) {
        let saveUser = await this.userRepository.findOne({
            where: { id: userId }
        });
        try {
            if (saveUser.dialCode == "+1" && saveUser.contactNumber == "9874561230") {
                await this.otpRepository.delete({ userId: userId });
                let otp = new otp_entity_1.Otp();
                otp.otp = 123456;
                otp.userId = userId;
                await this.otpRepository.save(otp);
                return {
                    status: true
                };
            }
            else {
                var randomOtp = Math.floor(100000 + Math.random() * 900000);
                const from = process.env.VONAGE_FROM_NUMBER;
                const to = `${saveUser.dialCode.replace("+", "") + saveUser.contactNumber}`;
                const text = `This is your One Time Otp: ${randomOtp} from I'm just fine! to help you to verify your phone number.`;
                await vonage.sms.send({ to, from, text })
                    .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                    .catch(err => {
                    console.log('There was an error sending the messages.', err["response"]);
                });
                await this.otpRepository.delete({ userId: userId });
                let otp = new otp_entity_1.Otp();
                otp.otp = randomOtp;
                otp.userId = userId;
                await this.otpRepository.save(otp);
                return {
                    status: true
                };
            }
        }
        catch (e) {
            console.log("twilio err", e.message);
            return ({
                status: false,
                message: e.message,
                result: {}
            });
        }
    }
    async sendOtpUsingContactNumber(loginUserId, dialCode, contactNumber) {
        try {
            let saveUser = await this.userRepository.findOne({
                where: { id: loginUserId }
            });
            if (saveUser.dialCode == "+1" && saveUser.contactNumber == "9874561230") {
                await this.otpRepository.delete({ userId: loginUserId });
                let otp = new otp_entity_1.Otp();
                otp.otp = 123456;
                otp.userId = loginUserId;
                await this.otpRepository.save(otp);
                return {
                    status: true
                };
            }
            else {
                const from = process.env.VONAGE_FROM_NUMBER;
                const to = `${dialCode.replace("+", "") + contactNumber}`;
                const text = `This is your One Time Otp: ${randomOtp} from I am just fine to help you to verify your phone number.`;
                await vonage.sms.send({ to, from, text })
                    .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                    .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
                var randomOtp = Math.floor(100000 + Math.random() * 900000);
                await this.otpRepository.delete({ userId: loginUserId });
                let otp = new otp_entity_1.Otp();
                otp.otp = randomOtp;
                otp.userId = loginUserId;
                await this.otpRepository.save(otp);
                return {
                    status: true
                };
            }
        }
        catch (e) {
            console.log("twilio err", e.message);
            return ({
                status: false,
                message: e.message,
                result: {}
            });
        }
    }
    async createDefaultSettingRecord(req, userObj) {
        var _a, _b, _c;
        try {
            let settingObj, start24TimeInHrMn, end24TimeInHrMn;
            ;
            const settingObjDetail = await this.settingRepository.findOne({
                where: {
                    userId: userObj.id
                }
            });
            if (!settingObjDetail) {
                settingObj = new setting_entity_1.Setting();
            }
            else {
                settingObj = settingObjDetail;
            }
            settingObj.sleepStartTime = (_a = req.sleepStartTime) !== null && _a !== void 0 ? _a : settingObj.sleepStartTime;
            settingObj.userId = userObj.id;
            settingObj.type = "notificationSetting";
            settingObj.sleepEndTime = (_b = req.sleepEndTime) !== null && _b !== void 0 ? _b : settingObj.sleepEndTime;
            settingObj.checkinTime = (_c = req.checkinTime) !== null && _c !== void 0 ? _c : settingObj.checkinTime;
            if (req.checkinTime != 30) {
                settingObj.checkinTimeInMinutes = req.checkinTime * 60;
            }
            else {
                settingObj.checkinTimeInMinutes = 30;
            }
            let sdateTime = (0, moment_1.default)("07:00 PM", 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');
            let edateTime = (0, moment_1.default)("09:00 AM", 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');
            if (userObj.userTimezone) {
                let combineTz;
                let statictime = "-04:00";
                if (userObj.userTimezone.indexOf("-") != -1) {
                    combineTz = userObj.userTimezone.split("-");
                    combineTz[1] = `-${combineTz[1]}`;
                }
                else {
                    combineTz = userObj.userTimezone.split("+");
                    combineTz[1] = `+${combineTz[1]}`;
                }
                if (combineTz[1]) {
                    start24TimeInHrMn = moment_1.default.utc(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
                    end24TimeInHrMn = moment_1.default.utc(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
                }
                else {
                    start24TimeInHrMn = moment_1.default.utc(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime).format('HH:mm:ss');
                    end24TimeInHrMn = moment_1.default.utc(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime).format('HH:mm:ss');
                }
            }
            else {
                let statictime = "-04:00";
                start24TimeInHrMn = moment_1.default.utc().utcOffset(statictime).format('HH:mm:ss');
                end24TimeInHrMn = moment_1.default.utc().utcOffset(statictime).format('HH:mm:ss');
            }
            settingObj.sleepStartTimeIn24Format = start24TimeInHrMn;
            settingObj.sleepEndTimeIn24Format = end24TimeInHrMn;
            return await this.settingRepository.save(settingObj);
        }
        catch (err) {
            console.log("err in default setting creation", err);
        }
    }
};
AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_2.InjectRepository)(user_entity_1.Users)),
    __param(3, (0, typeorm_2.InjectRepository)(otp_entity_1.Otp)),
    __param(4, (0, typeorm_2.InjectRepository)(setting_entity_1.Setting)),
    __param(5, (0, typeorm_2.InjectRepository)(user_token_entity_1.UserToken)),
    __param(6, (0, typeorm_2.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        notification_service_1.NotificationService,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository,
        typeorm_1.Repository])
], AuthService);
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map