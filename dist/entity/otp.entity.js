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
exports.Otp = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const enum_1 = require("../enums/enum");
const user_entity_1 = require("./user.entity");
let Otp = class Otp extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", Number)
], Otp.prototype, "otp", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Otp.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "tinyint", default: enum_1.Boolean.False }),
    __metadata("design:type", Number)
], Otp.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (users) => users.otp),
    __metadata("design:type", user_entity_1.Users)
], Otp.prototype, "user", void 0);
Otp = __decorate([
    (0, typeorm_1.Entity)('otps')
], Otp);
exports.Otp = Otp;
//# sourceMappingURL=otp.entity.js.map