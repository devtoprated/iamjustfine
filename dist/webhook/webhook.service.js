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
exports.WebhookService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../entity/subscription.entity");
const user_token_entity_1 = require("../entity/user-token.entity");
const plans_entity_1 = require("../entity/plans.entity");
const stripe_service_1 = require("../utilities/stripe.service");
const user_entity_1 = require("../entity/user.entity");
let WebhookService = class WebhookService {
    constructor(subscriptionRepository, userTokenRepository, PlansRepository, UsersRepository, stripeService) {
        this.subscriptionRepository = subscriptionRepository;
        this.userTokenRepository = userTokenRepository;
        this.PlansRepository = PlansRepository;
        this.UsersRepository = UsersRepository;
        this.stripeService = stripeService;
    }
    async handleSubscriptionWebhook(req, res, rawBody) {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.stripeService.handleSubscriptionWebhook(req, res, rawBody);
            }
            catch (err) {
                console.log(err);
                reject({
                    status: false,
                    error: ` ${err}  Error, please check server logs for more information...`,
                });
            }
        });
    }
};
WebhookService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(user_token_entity_1.UserToken)),
    __param(2, (0, typeorm_1.InjectRepository)(plans_entity_1.Plans)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stripe_service_1.StripeService])
], WebhookService);
exports.WebhookService = WebhookService;
//# sourceMappingURL=webhook.service.js.map