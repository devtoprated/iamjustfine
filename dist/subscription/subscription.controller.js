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
exports.SubscriptionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subscription_service_1 = require("./subscription.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const subscription_dto_1 = require(".././dto/subscription/subscription.dto");
const updateSubscriptionPlan_dto_1 = require("../dto/subscription/updateSubscriptionPlan.dto");
const deleteSubscribedNumber_dto_1 = require("../dto/subscription/deleteSubscribedNumber.dto");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async subscriptionPlanList(req, res) {
        const response = await this.subscriptionService.subscriptionPlanList(res, req.user);
        res.send(response);
    }
    async updateStatus(purchasePlanDto, req, res, err) {
        const response = await this.subscriptionService.purchaseSubscription(req, res, req.user);
        res.send(response);
    }
    async cancelSubscriptionPlan(req, res, subscriptionId = "") {
        const response = await this.subscriptionService.cancelSubscription(req, res, subscriptionId);
        res.send(response);
    }
    ;
    async updateUserSubscriptionPlan(purchasePlanDto, req, res, subscriptionPlanId = "") {
        const response = await this.subscriptionService.updateUserSubscriptionPlan(req, res, subscriptionPlanId, purchasePlanDto);
        res.send(response);
    }
    ;
    async updateUserinExistingSubscription(purchasePlanDto, req, res, subscriptionPlanId = "") {
        const response = await this.subscriptionService.updateUserinExistingSubscription(req, res, subscriptionPlanId, purchasePlanDto);
        res.send(response);
    }
    ;
    async deleteSubscribedNumber(deleteSubscribedNumberDto, req, res) {
        const response = await this.subscriptionService.deleteSubscribedNumber(req.body, res);
        res.send(response);
    }
    ;
};
__decorate([
    (0, swagger_1.ApiTags)('Subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    (0, common_1.Get)('subscription-plans-list'),
    (0, swagger_1.ApiBearerAuth)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "subscriptionPlanList", null);
__decorate([
    (0, swagger_1.ApiTags)('Subscription'),
    (0, common_1.Post)('purchase-subscription-plan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [subscription_dto_1.purchasePlanDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updateStatus", null);
__decorate([
    (0, swagger_1.ApiTags)('Subscription'),
    (0, common_1.Get)('cancelSubscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "cancelSubscriptionPlan", null);
__decorate([
    (0, swagger_1.ApiTags)('Subscription'),
    (0, common_1.Post)('update-subscription-plan'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateSubscriptionPlan_dto_1.updateSubscriptionPlanDto, Object, Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updateUserSubscriptionPlan", null);
__decorate([
    (0, swagger_1.ApiTags)("Subscription"),
    (0, common_1.Post)('update-contacts-in-subscription'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __param(3, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [updateSubscriptionPlan_dto_1.updateSubscriptionPlanDto, Object, Object, String]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "updateUserinExistingSubscription", null);
__decorate([
    (0, swagger_1.ApiTags)("Subscription"),
    (0, common_1.Post)('delete-subscribed-number'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOkResponse)({ status: 200 }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [deleteSubscribedNumber_dto_1.deleteSubscribedNumberDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SubscriptionController.prototype, "deleteSubscribedNumber", null);
SubscriptionController = __decorate([
    (0, common_1.Controller)('subscription'),
    __metadata("design:paramtypes", [subscription_service_1.SubscriptionService])
], SubscriptionController);
exports.SubscriptionController = SubscriptionController;
//# sourceMappingURL=subscription.controller.js.map