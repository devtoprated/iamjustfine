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
exports.OtpService = void 0;
require('dotenv').config();
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const otp_entity_1 = require("../entity/otp.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entity/user.entity");
const jwt_1 = require("@nestjs/jwt");
const enum_1 = require("../enums/enum");
const auth_service_1 = require("../auth/auth.service");
const user_token_entity_1 = require("../entity/user-token.entity");
const configuration_entity_1 = require("../entity/configuration.entity");
let OtpService = class OtpService {
    constructor(jwtService, authService, userRepository, otpRepository, userTokenRepository, appConfiguration) {
        this.jwtService = jwtService;
        this.authService = authService;
        this.userRepository = userRepository;
        this.otpRepository = otpRepository;
        this.userTokenRepository = userTokenRepository;
        this.appConfiguration = appConfiguration;
    }
    async verifyOtp(req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                let contactList;
                let { dialCode, contactNumber, otp, deviceToken, deviceType } = req;
                let isExits = await this.authService.existsBycontactNumber(contactNumber, dialCode);
                {
                }
                if (isExits) {
                    if (otp == isExits.otp.otp && isExits.otp.isVerified == 0) {
                        var add15Minutes = new Date(isExits.otp.createdAt.getTime() + 15 * 60000);
                        if (add15Minutes >= new Date()) {
                            isExits.otp.isVerified = enum_1.Boolean.True;
                            await this.otpRepository.save(isExits.otp);
                            let payload = { sub: isExits.id, name: isExits.name, dialCode: isExits.dialCode, contactNumber: isExits.contactNumber };
                            let token = this.jwtService.sign(payload);
                            isExits.isVerified = true;
                            isExits.deviceType = deviceType;
                            isExits.deviceToken = deviceToken;
                            var result = {
                                id: isExits.id,
                                name: isExits.name,
                                contactNumber: isExits.contactNumber,
                                isVerified: +isExits.isVerified,
                                dialCode: isExits.dialCode,
                                deviceType: isExits.deviceType,
                                deviceToken: isExits.deviceToken,
                                picture: isExits.picture,
                                token: token,
                                contacts: contactList
                            };
                            this.userRepository.save(isExits);
                            let obj = {
                                "userId": isExits.id,
                                "token": token
                            };
                            await this.storeUserToken(obj);
                            resolve({
                                status: true,
                                message: "Confirmation code verified successfully.",
                                result: result
                            });
                        }
                        else {
                            resolve({
                                status: false,
                                message: "Confirmation code expired.",
                            });
                        }
                    }
                    else {
                        resolve({
                            status: false,
                            message: "Invalid Confirmation code please try again.",
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: "Invalid contact number please try again...",
                    });
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
    async updateProfileOtp(req, res, loginUserId) {
        return new Promise(async (resolve, reject) => {
            try {
                let { dialCode, contactNumber } = req;
                let isExits = await this.authService.existsBycontactNumber(contactNumber, dialCode);
                if (isExits) {
                    if (isExits.id == loginUserId) {
                        resolve({
                            status: false,
                            message: "This number is already verified by you.",
                        });
                    }
                    else {
                        resolve({
                            status: false,
                            message: "Account already exists",
                        });
                    }
                }
                else {
                    let otpRecord = await this.authService.sendOtpUsingContactNumber(loginUserId, dialCode, contactNumber);
                    if (otpRecord.status) {
                        resolve({
                            status: true,
                            message: "Confirmation code sent successfully...",
                        });
                    }
                    else {
                        resolve({
                            status: false,
                            message: otpRecord.message,
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
    async deletePreviousOtp(loginUserId) {
        return await this.otpRepository.delete({ userId: loginUserId });
    }
    async updateOtpVerification(req, res, loginUserId) {
        return new Promise(async (resolve, reject) => {
            try {
                let { otp } = req;
                let otpRecord = await this.otpExistWithUserId(loginUserId);
                if (otpRecord) {
                    if (otp == otpRecord.otp && otpRecord.isVerified == 0) {
                        var add15Minutes = new Date(otpRecord.createdAt.getTime() + 15 * 60000);
                        if (add15Minutes >= new Date()) {
                            otpRecord.isVerified = enum_1.Boolean.True;
                            await this.otpRepository.save(otpRecord);
                            resolve({
                                status: true,
                                message: "Confirmation code verified successfully.",
                                result: { "success": true }
                            });
                        }
                        else {
                            resolve({
                                status: false,
                                message: "Confirmation code expired.",
                            });
                        }
                    }
                    else {
                        resolve({
                            status: false,
                            message: "Invalid confirmation code.",
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: "Invalid confirmation code.",
                    });
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
    async otpExistWithUserId(userId) {
        try {
            console.log({ userId });
            return await this.otpRepository.findOne({ where: { userId: userId } });
        }
        catch (err) {
            console.log("error", err);
        }
    }
    async resentOtp(req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                let { dialCode, contactNumber } = req;
                let isExits = await this.authService.existsBycontactNumber(contactNumber, dialCode);
                if (!isExits) {
                    resolve({
                        status: false,
                        message: "Account doesn't exist...",
                        result: {}
                    });
                }
                let otp = await this.authService.generateOtp(isExits.id);
                resolve({
                    status: true,
                    message: "Confirmation code sent successfully.",
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
    async storeUserToken(obj) {
        try {
            await this.userTokenRepository.delete({ userId: obj.userId });
            let userToken = new user_token_entity_1.UserToken();
            userToken.token = obj.token;
            userToken.userId = obj.userId;
            return await this.userTokenRepository.save(userToken);
        }
        catch (err) {
            console.log("store token err", err);
        }
    }
    async configurationDetail(req, res) {
        try {
            let { dialCode, contactNumber } = req;
            var isUserExists = await this.userRepository.findOne({
                where: [
                    {
                        contactNumber: contactNumber,
                        dialCode: dialCode,
                    },
                ],
            });
            var configurations = await this.appConfiguration.find();
            let iosConfig = configurations.find((item) => (item.configurationFor).toLowerCase() === "ios");
            let androidConfig = configurations.find((item) => (item.configurationFor).toLowerCase() === "andoid");
            return ({
                status: true,
                message: "Configuration Detail fetched Successfully",
                result: {
                    "isApprovedByAdmin": isUserExists.isApprovedByAdmin,
                    "LaterAppVersionForIOS": iosConfig === null || iosConfig === void 0 ? void 0 : iosConfig.latestAppVersion,
                    "LaterAppVersionForAndroid": androidConfig === null || androidConfig === void 0 ? void 0 : androidConfig.latestAppVersion,
                    "isUpdateForcefullyForiOS": iosConfig === null || iosConfig === void 0 ? void 0 : iosConfig.isForcefullyUpdateNeeded,
                    "isUpdateForcefully": androidConfig === null || androidConfig === void 0 ? void 0 : androidConfig.isForcefullyUpdateNeeded
                }
            });
        }
        catch (err) {
            console.log("config  err", err);
        }
    }
    async approveUser(req, res) {
        try {
            let { dialCode, contactNumber } = req;
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
            isUserExists.isApprovedByAdmin = true;
            this.userRepository.save(isUserExists);
            return ({
                status: true,
                message: "User Approved SuccessFully.",
                result: isUserExists
            });
        }
        catch (err) {
            console.log("config  err", err);
        }
    }
    async demoEmailSend() {
        var isUserExists = await this.userRepository.findOne({
            where: {
                dialCode: "+91",
            }
        });
    }
};
OtpService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __param(3, (0, typeorm_1.InjectRepository)(otp_entity_1.Otp)),
    __param(4, (0, typeorm_1.InjectRepository)(user_token_entity_1.UserToken)),
    __param(5, (0, typeorm_1.InjectRepository)(configuration_entity_1.AppConfiguration)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        auth_service_1.AuthService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OtpService);
exports.OtpService = OtpService;
//# sourceMappingURL=otp.service.js.map