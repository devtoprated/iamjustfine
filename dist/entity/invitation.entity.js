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
exports.Invitation = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const enum_1 = require("../enums/enum");
const user_entity_1 = require("./user.entity");
let Invitation = class Invitation extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.Column)({ default: enum_1.InvitationType.MyFollower }),
    __metadata("design:type", Number)
], Invitation.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Invitation.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: enum_1.Status.Pending }),
    __metadata("design:type", String)
], Invitation.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Invitation.prototype, "invitedTo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (users) => users.invitation),
    __metadata("design:type", user_entity_1.Users)
], Invitation.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (users) => users.invitedTo),
    (0, typeorm_1.JoinColumn)({ name: 'invitedTo' }),
    __metadata("design:type", user_entity_1.Users)
], Invitation.prototype, "invitedUser", void 0);
Invitation = __decorate([
    (0, typeorm_1.Entity)('invitations')
], Invitation);
exports.Invitation = Invitation;
//# sourceMappingURL=invitation.entity.js.map