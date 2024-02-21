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
exports.Subscription = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const user_entity_1 = require("./user.entity");
const multipleUserSubscription_entity_1 = require("./multipleUserSubscription.entity");
const plans_entity_1 = require("./plans.entity");
let Subscription = class Subscription extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Subscription.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Subscription.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Subscription.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 1 }),
    __metadata("design:type", String)
], Subscription.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Subscription.prototype, "dateCreation", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], Subscription.prototype, "stripeSubscriptionPlanId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (user) => user.subscriptions),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.Users)
], Subscription.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => multipleUserSubscription_entity_1.MultipleUserSubscription, (multisubscription) => multisubscription.subscription),
    __metadata("design:type", Array)
], Subscription.prototype, "multisubscription", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plans_entity_1.Plans, (plan) => plan.subscriptions, { eager: true, cascade: true }),
    (0, typeorm_1.JoinColumn)({ name: 'planId' }),
    __metadata("design:type", plans_entity_1.Plans)
], Subscription.prototype, "plan", void 0);
Subscription = __decorate([
    (0, typeorm_1.Entity)('subscription')
], Subscription);
exports.Subscription = Subscription;
//# sourceMappingURL=subscription.entity.js.map