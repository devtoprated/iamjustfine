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
exports.Users = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const enum_1 = require("../enums/enum");
const class_validator_1 = require("class-validator");
const user_token_entity_1 = require("./user-token.entity");
const otp_entity_1 = require("./otp.entity");
const health_status_entity_1 = require("./health-status.entity");
const invitation_entity_1 = require("./invitation.entity");
const user_monitor_entity_1 = require("./user-monitor.entity");
const setting_entity_1 = require("./setting.entity");
const subscription_entity_1 = require("./subscription.entity");
const plans_entity_1 = require("./plans.entity");
let Users = class Users extends shared_entity_1.SharedEntity {
    generateFullContactNumber() {
        this.fullContactNumber = `${this.dialCode != null ? this.dialCode.replace(/\+/g, '') : this.dialCode}${this.contactNumber}`;
    }
    generateFullProfileImagePath() {
        this.profileImageLink = `${this.picture != null ? process.env.nodeSiteUrl + "/" + this.picture : this.picture}`;
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Users.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Users.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Users.prototype, "contactNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Users.prototype, "dialCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Users.prototype, "deviceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Users.prototype, "deviceToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Users.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: enum_1.Boolean.False }),
    __metadata("design:type", Boolean)
], Users.prototype, "isEmailSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: enum_1.Boolean.False }),
    __metadata("design:type", Boolean)
], Users.prototype, "isSubscriptionPurchased", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: enum_1.Boolean.False }),
    __metadata("design:type", Boolean)
], Users.prototype, "isApprovedByAdmin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Users.prototype, "picture", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Users.prototype, "fullContactNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], Users.prototype, "profileImageLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null, type: 'timestamp' }),
    __metadata("design:type", Date)
], Users.prototype, "lastCheckin", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null, type: 'timestamp' }),
    __metadata("design:type", Date)
], Users.prototype, "warningTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Users.prototype, "userTimezone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Users.prototype, "islogOut", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Users.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], Users.prototype, "isNotificationAllowed", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", String)
], Users.prototype, "customerId", void 0);
__decorate([
    (0, typeorm_1.AfterLoad)(),
    (0, typeorm_1.AfterInsert)(),
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Users.prototype, "generateFullContactNumber", null);
__decorate([
    (0, typeorm_1.AfterLoad)(),
    (0, typeorm_1.AfterInsert)(),
    (0, typeorm_1.AfterUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Users.prototype, "generateFullProfileImagePath", null);
__decorate([
    (0, typeorm_1.OneToOne)(() => otp_entity_1.Otp, (otp) => otp.user),
    __metadata("design:type", otp_entity_1.Otp)
], Users.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_token_entity_1.UserToken, (userToken) => userToken.user),
    __metadata("design:type", Array)
], Users.prototype, "tokens", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => health_status_entity_1.HealthStatus, (currentStatus) => currentStatus.user),
    __metadata("design:type", Array)
], Users.prototype, "currentStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_monitor_entity_1.UserMonitor, (userMonitor) => userMonitor.helper),
    __metadata("design:type", Array)
], Users.prototype, "helpers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_monitor_entity_1.UserMonitor, (userMonitor) => userMonitor.careReceivers),
    __metadata("design:type", Array)
], Users.prototype, "careReceivers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invitation_entity_1.Invitation, (invitation) => invitation.user),
    __metadata("design:type", Array)
], Users.prototype, "invitation", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invitation_entity_1.Invitation, (invitation) => invitation.invitedTo),
    __metadata("design:type", Array)
], Users.prototype, "invitedTo", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => setting_entity_1.Setting, (setting) => setting.user),
    __metadata("design:type", Array)
], Users.prototype, "setting", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, subscription => subscription.user),
    __metadata("design:type", Array)
], Users.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => plans_entity_1.Plans, plans => plans.user),
    __metadata("design:type", Array)
], Users.prototype, "plans", void 0);
Users = __decorate([
    (0, typeorm_1.Entity)('users')
], Users);
exports.Users = Users;
//# sourceMappingURL=user.entity.js.map