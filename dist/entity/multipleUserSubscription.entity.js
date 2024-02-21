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
exports.MultipleUserSubscription = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const user_entity_1 = require("./user.entity");
const subscription_entity_1 = require("./subscription.entity");
const plans_entity_1 = require("./plans.entity");
let MultipleUserSubscription = class MultipleUserSubscription extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], MultipleUserSubscription.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], MultipleUserSubscription.prototype, "planId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], MultipleUserSubscription.prototype, "subscriptionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], MultipleUserSubscription.prototype, "contactNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], MultipleUserSubscription.prototype, "dialCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subscription_entity_1.Subscription, (subscription) => subscription.id),
    (0, typeorm_1.JoinColumn)({ name: "subscriptionId" }),
    __metadata("design:type", subscription_entity_1.Subscription)
], MultipleUserSubscription.prototype, "subscription", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (user) => user.id),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.Users)
], MultipleUserSubscription.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => plans_entity_1.Plans, (plan) => plan.multiUserSubscription),
    (0, typeorm_1.JoinColumn)({ name: "planId" }),
    __metadata("design:type", plans_entity_1.Plans)
], MultipleUserSubscription.prototype, "plan", void 0);
MultipleUserSubscription = __decorate([
    (0, typeorm_1.Entity)('multipleUserSubscription')
], MultipleUserSubscription);
exports.MultipleUserSubscription = MultipleUserSubscription;
//# sourceMappingURL=multipleUserSubscription.entity.js.map