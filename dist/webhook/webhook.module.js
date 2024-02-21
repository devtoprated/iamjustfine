"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var WebhookModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookModule = void 0;
const common_1 = require("@nestjs/common");
const webhook_service_1 = require("./webhook.service");
const stripe_service_1 = require("../utilities/stripe.service");
const webhook_controller_1 = require("./webhook.controller");
const user_entity_1 = require("../entity/user.entity");
const otp_entity_1 = require("../entity/otp.entity");
const typeorm_1 = require("@nestjs/typeorm");
const passport_1 = require("@nestjs/passport");
const jwt_1 = require("@nestjs/jwt");
const user_token_entity_1 = require("../entity/user-token.entity");
const subscription_entity_1 = require("../entity/subscription.entity");
const plans_entity_1 = require("../entity/plans.entity");
const multipleUserSubscription_entity_1 = require("../entity/multipleUserSubscription.entity");
let WebhookModule = WebhookModule_1 = class WebhookModule {
};
WebhookModule = WebhookModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([user_entity_1.Users, otp_entity_1.Otp,
                passport_1.PassportModule, subscription_entity_1.Subscription, user_token_entity_1.UserToken, plans_entity_1.Plans, multipleUserSubscription_entity_1.MultipleUserSubscription
            ])],
        providers: [{
                provide: 'STRIPE_KEY',
                useValue: process.env.STRIPE_SECRET_KEY,
            }, stripe_service_1.StripeService, webhook_service_1.WebhookService, jwt_1.JwtService],
        controllers: [webhook_controller_1.WebhookController],
        exports: [WebhookModule_1]
    })
], WebhookModule);
exports.WebhookModule = WebhookModule;
//# sourceMappingURL=webhook.module.js.map