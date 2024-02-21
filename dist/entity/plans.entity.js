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
exports.Plans = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const user_entity_1 = require("./user.entity");
const subscription_entity_1 = require("./subscription.entity");
const multipleUserSubscription_entity_1 = require("./multipleUserSubscription.entity");
let Plans = class Plans extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Plans.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Plans.prototype, "stripePlanId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Plans.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Plans.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Plans.prototype, "duration", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", String)
], Plans.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Plans.prototype, "columnOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Plans.prototype, "dateCreation", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.Users)
], Plans.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subscription_entity_1.Subscription, subscription => subscription.plan),
    __metadata("design:type", Array)
], Plans.prototype, "subscriptions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => multipleUserSubscription_entity_1.MultipleUserSubscription, MultiUserSubscription => MultiUserSubscription.planId),
    __metadata("design:type", Array)
], Plans.prototype, "multiUserSubscription", void 0);
Plans = __decorate([
    (0, typeorm_1.Entity)('plans')
], Plans);
exports.Plans = Plans;
//# sourceMappingURL=plans.entity.js.map