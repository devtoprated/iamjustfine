"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const resgiter_dto_1 = require(".././dto/users/resgiter.dto");
const auth_service_1 = require("../auth/auth.service");
const users_service_1 = require("./users.service");
const checkin_dto_1 = require(".././dto/checkin/checkin.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const edit_profile_dto_1 = require(".././dto/users/edit-profile.dto");
const fs = __importStar(require("fs"));
const path_1 = require("path");
const checkinStatus_dto_1 = require("../dto/checkin/checkinStatus.dto");
const schedule_1 = require("@nestjs/schedule");
const push_notification_dto_1 = require("../dto/notification/push-notification.dto");
let UsersController = class UsersController {
    constructor(authService, userService) {
        this.authService = authService;
        this.userService = userService;
    }
    async register(registerDto, res) {
        const response = await this.authService.register(registerDto, res);
        res.send(response);
    }
    async getProfile(req, res) {
        const response = await this.userService.getProfile(res, req.user);
        res.send(response);
    }
    async uploadeImage(picture, editProfileDto, req, res) {
        let img = null;
        if (picture != undefined) {
            img = `uploades/${picture.filename}`;
        }
        let userId = req.user.sub;
        const response = await this.userService.updateProfile(editProfileDto, img, res, userId);
        res.send(response);
    }
    async checkin(healthstatus, req, res) {
        const response = await this.userService.checkin(healthstatus, res, req.user);
        res.send(response);
    }
    async changeCheckInStatus(checkinStatus, req, res) {
        const response = await this.userService.changeCheckInStatus(checkinStatus, res, req.user);
        res.send(response);
    }
    async logoutUser(req, res) {
        const response = await this.userService.logoutUser(req, res, req.user);
        res.send(response);
    }
    async runCron() {
        this.userService.notCheckinUsersCron();
    }
    async deleteAccount(req, res) {
        const response = await this.userService.deleteAccount(req.user.sub, res);
        res.send(response);
    }
    async sendPushNotification(pushNotificationdto, req, res) {
        const response = this.userService.sendDemoPushNotification(pushNotificationdto);
        res.send(response);
    }
    async deleteUserAccount(contactNumber, dialCode, req, res) {
        return await this.userService.deleteUserAccount(contactNumber, dialCode, req, res);
    }
};
__decorate([
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, common_1.Post)('registration'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [resgiter_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, swagger_1.ApiTags)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Post)('update'),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                },
                picture: {
                    type: 'string',
                    format: 'binary',
                },
                dialCode: {
                    type: 'string',
                    default: "+91",
                },
                contactNumber: {
                    type: 'string',
                    default: "123456789",
                }
            },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('picture', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, picture, cb) => {
                if (picture.mimetype == "image/jpeg" || picture.mimetype == "image/jpg" || picture.mimetype == "image/png") {
                    const directory = `./public/uploades`;
                    if (!fs.existsSync(directory)) {
                        fs.mkdirSync(directory, { recursive: true });
                    }
                    return cb(null, directory);
                }
                else {
                    return cb(new common_1.HttpException(`Unsupported picture type ${picture.originalname}`, common_1.HttpStatus.BAD_REQUEST), "false");
                }
            },
            filename: (req, picture, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${(0, path_1.extname)(picture.originalname)}`);
            }
        })
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, edit_profile_dto_1.EditProfileDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "uploadeImage", null);
__decorate([
    (0, swagger_1.ApiTags)('checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, common_1.Post)('checkin'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkin_dto_1.checkInDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "checkin", null);
__decorate([
    (0, swagger_1.ApiTags)('checkin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, common_1.Post)('change/status'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [checkinStatus_dto_1.checkinStatusInDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changeCheckInStatus", null);
__decorate([
    (0, swagger_1.ApiTags)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "logoutUser", null);
__decorate([
    (0, schedule_1.Cron)('0 */1 * * * *'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "runCron", null);
__decorate([
    (0, swagger_1.ApiTags)('Account'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Get)('delete/account'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteAccount", null);
__decorate([
    (0, swagger_1.ApiTags)('Push Notification'),
    (0, common_1.Post)('send-pushNoitification'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [push_notification_dto_1.PushNotificationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendPushNotification", null);
__decorate([
    (0, swagger_1.ApiTags)('Account'),
    (0, common_1.Delete)('delete-user-account/:contactNumber/:dialCode'),
    (0, swagger_1.ApiParam)({ name: 'contactNumber', type: String }),
    (0, swagger_1.ApiParam)({ name: 'dialCode', type: String }),
    __param(0, (0, common_1.Param)('contactNumber')),
    __param(1, (0, common_1.Param)('dialCode')),
    __param(2, (0, common_1.Req)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUserAccount", null);
UsersController = __decorate([
    (0, common_1.Controller)('user'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        users_service_1.UsersService])
], UsersController);
exports.UsersController = UsersController;
//# sourceMappingURL=users.controller.js.map