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
exports.OtpController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const resend_otp_dto_1 = require("../dto/otp/resend-otp.dto");
const verify_otp_dto_1 = require("../dto/otp/verify-otp.dto");
const otp_service_1 = require("./otp.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const verify_profile_otp_dto_1 = require("../dto/otp/verify-profile-otp.dto");
const configuration_dto_1 = require("../dto/users/configuration.dto");
let OtpController = class OtpController {
    constructor(otpService) {
        this.otpService = otpService;
    }
    async verifyOtp(verifyOtpDto, res) {
        const response = await this.otpService.verifyOtp(verifyOtpDto, res);
        res.send(response);
    }
    async resentOtp(resendOtp, req, res) {
        const response = await this.otpService.resentOtp(resendOtp, res);
        res.send(response);
    }
    async updateProfileOtp(resendOtp, req, res) {
        const response = await this.otpService.updateProfileOtp(resendOtp, res, req.user.sub);
        res.send(response);
    }
    async updateOtpVerification(verifyOtpDto, req, res) {
        const response = await this.otpService.updateOtpVerification(verifyOtpDto, res, req.user.sub);
        res.send(response);
    }
    async configurationDetail(configDto, req, res) {
        const response = await this.otpService.configurationDetail(configDto, res);
        res.send(response);
    }
    async approveUser(configDto, req, res) {
        const response = await this.otpService.approveUser(configDto, res);
        res.send(response);
    }
    async demoEmail(req, res) {
        const response = await this.otpService.demoEmailSend();
        res.send(response);
    }
};
__decorate([
    (0, swagger_1.ApiTags)('otp'),
    (0, common_1.Post)('otp/verify'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_otp_dto_1.VerifyOtpDto, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "verifyOtp", null);
__decorate([
    (0, swagger_1.ApiTags)('otp'),
    (0, common_1.Post)('resent/otp'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_otp_dto_1.ResendOtp, Object, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "resentOtp", null);
__decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, common_1.Post)('profile/resent/otp'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resend_otp_dto_1.ResendOtp, Object, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "updateProfileOtp", null);
__decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, common_1.Post)('profile/otp/verification'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_profile_otp_dto_1.VerifyProfileOtpDto, Object, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "updateOtpVerification", null);
__decorate([
    (0, swagger_1.ApiTags)('configuration'),
    (0, common_1.Post)('configuration/detail'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [configuration_dto_1.ConfigurationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "configurationDetail", null);
__decorate([
    (0, swagger_1.ApiTags)('Approve'),
    (0, common_1.Post)('approve/user'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [configuration_dto_1.ConfigurationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "approveUser", null);
__decorate([
    (0, swagger_1.ApiTags)('Demo Email'),
    (0, common_1.Get)('demo/email'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OtpController.prototype, "demoEmail", null);
OtpController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [otp_service_1.OtpService])
], OtpController);
exports.OtpController = OtpController;
//# sourceMappingURL=otp.controller.js.map