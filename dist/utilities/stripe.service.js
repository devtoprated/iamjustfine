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
exports.StripeService = void 0;
const common_1 = require("@nestjs/common");
const stripe_1 = require("stripe");
const user_entity_1 = require("../entity/user.entity");
const subscription_entity_1 = require("../entity/subscription.entity");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const multipleUserSubscription_entity_1 = require("../entity/multipleUserSubscription.entity");
const plans_entity_1 = require("../entity/plans.entity");
let StripeService = class StripeService {
    constructor(stripeKey, UsersRepository, multiUserSubscriptionRepository, SubscriptionRepository, planRepository) {
        this.stripeKey = stripeKey;
        this.UsersRepository = UsersRepository;
        this.multiUserSubscriptionRepository = multiUserSubscriptionRepository;
        this.SubscriptionRepository = SubscriptionRepository;
        this.planRepository = planRepository;
        this.stripe = new stripe_1.Stripe(stripeKey, {
            apiVersion: '2023-10-16',
        });
    }
    async createPlan(planData) {
        return this.stripe.plans.create(planData);
    }
    createCustomer(phone, metadata) {
        return this.stripe.customers.create({
            phone,
            metadata: metadata,
        });
    }
    async createSession(planId, user, plan, DATA) {
        try {
            let metadata = {
                sfsd: "sfsfsd"
            };
            const session = this.stripe.checkout.sessions.create({
                success_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel',
                payment_method_types: ['card'],
                billing_address_collection: 'auto',
                line_items: [
                    {
                        price: planId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                metadata: {
                    userId: user.id,
                    planId: planId,
                    type: plan.type,
                    customerDetails: JSON.stringify(DATA.customerContactNo),
                    subscriptionPlanId: DATA.subscriptionPlanId
                }
            });
            return session;
        }
        catch (error) {
            console.error('Error creating checkout session:', error);
            throw new Error('Error creating checkout session');
        }
    }
    async handleSubscriptionWebhook(req, res, rawBody) {
        var _a;
        try {
            const sig = req.headers['stripe-signature'];
            let event;
            try {
                event = this.stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
            }
            catch (err) {
                console.error('Webhook Error:', err.message);
                res.status(400).send(`Webhook Error: ${err.message}`);
                return;
            }
            switch (event.type) {
                case 'invoice.payment_succeeded':
                    const invoice = event.data.object;
                    console.log('Payment succeeded:', invoice);
                    break;
                case 'invoice.payment_failed':
                    const failedInvoice = event.data.object;
                    console.log('Payment failed:', failedInvoice);
                    const isSubscriptionCheck = await this.SubscriptionRepository.findOne({
                        where: {
                            stripeSubscriptionPlanId: failedInvoice.subscription
                        }
                    });
                    if (isSubscriptionCheck) {
                        await this.cancelUserSubscriptionPlan(isSubscriptionCheck);
                    }
                    break;
                case 'customer.subscription.created':
                    const subscriptionCreated = event.data.object;
                    console.log('Subscription created:', subscriptionCreated);
                    const customerId = subscriptionCreated.customer;
                    const customer = await this.stripe.customers.retrieve(customerId);
                    console.log('Customer details:', customer);
                    break;
                case 'customer.subscription.updated':
                    const subscriptionUpdated = event.data.object;
                    console.log('Subscription updated:', subscriptionUpdated);
                    break;
                case 'customer.subscription.deleted':
                    const subscriptionDeleted = event.data.object;
                    console.log(subscriptionDeleted, "delete subscription event");
                    await this.removeUserSubscriptionfromDb(subscriptionDeleted);
                    break;
                case 'checkout.session.completed':
                    console.log("hi i am in complete session ");
                    const sessionComplete = event.data.object;
                    const data = sessionComplete.metadata;
                    const contactData = JSON.parse((_a = sessionComplete.metadata) === null || _a === void 0 ? void 0 : _a.customerDetails);
                    const user = await this.UsersRepository.findOne({ where: { id: data.userId } });
                    try {
                        let savedSubscription = await this.SubscriptionRepository.save({
                            userId: user.id,
                            planId: data.subscriptionPlanId,
                            type: data.type,
                            stripeSubscriptionPlanId: sessionComplete === null || sessionComplete === void 0 ? void 0 : sessionComplete.subscription
                        });
                        let userData = contactData;
                        let multipleUserSubscriptionArray = contactData.map((value) => {
                            value.userId = data.userId;
                            value.subscriptionId = savedSubscription.id;
                            value.planId = data.subscriptionPlanId;
                            return value;
                        });
                        await this.multiUserSubscriptionRepository.save(multipleUserSubscriptionArray);
                        await Promise.all(userData.map(async (item) => {
                            const updateUser = await this.UsersRepository.update({ contactNumber: item.contactNumber, dialCode: item.dialCode }, { isSubscriptionPurchased: true });
                        }));
                    }
                    catch (err) {
                        console.log("Here error is", err);
                    }
                    console.log('session Complete:', sessionComplete);
                    break;
                case 'checkout.session.expired':
                    const checkoutSessionExpired = event.data.object;
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }
        }
        catch (error) {
            console.error('Error handling subscription webhook:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    async removeUserSubscriptionfromDb(subscriptionDeleted) {
        try {
            const dataToBeRemove = await this.SubscriptionRepository.findOne({
                where: {
                    stripeSubscriptionPlanId: subscriptionDeleted.id,
                },
            });
            if (dataToBeRemove) {
                await this.SubscriptionRepository.delete(dataToBeRemove.id);
                const multipleUserSubscriptions = await this.multiUserSubscriptionRepository.find({
                    where: {
                        subscriptionId: dataToBeRemove === null || dataToBeRemove === void 0 ? void 0 : dataToBeRemove.id,
                    },
                    select: ["dialCode", "contactNumber"],
                });
                await multipleUserSubscriptions.map(async (data) => {
                    let userToUpdate = await this.UsersRepository.findOne({
                        where: {
                            contactNumber: data.contactNumber,
                            dialCode: data === null || data === void 0 ? void 0 : data.dialCode
                        }
                    });
                    if (userToUpdate && (userToUpdate === null || userToUpdate === void 0 ? void 0 : userToUpdate.isSubscriptionPurchased) == true) {
                        userToUpdate.isSubscriptionPurchased = false;
                        await this.UsersRepository.save(userToUpdate);
                    }
                    ;
                });
                await this.multiUserSubscriptionRepository.delete({
                    subscriptionId: dataToBeRemove === null || dataToBeRemove === void 0 ? void 0 : dataToBeRemove.id,
                });
            }
            ;
        }
        catch (err) {
            console.log("Error is", err);
            throw err;
        }
    }
    async cancelUserSubscriptionPlan(isSubscriptionCheck) {
        try {
            let messages = "";
            const cancelSubs = await this.stripe.subscriptions.cancel(isSubscriptionCheck === null || isSubscriptionCheck === void 0 ? void 0 : isSubscriptionCheck.stripeSubscriptionPlanId);
            messages = `Your subscription is cancelled successfully`;
            return messages;
        }
        catch (err) {
            console.log("Error is", err);
            throw err;
        }
    }
    async updateUserPlan(alreadySubscribedStripePlanId, alreadySubscribedPlan, purchasePlanDto, loggedInUserId) {
        try {
            let message = "";
            const currentSubscription = await this.stripe.subscriptions.retrieve(alreadySubscribedStripePlanId);
            if (currentSubscription) {
                const subscriptionDeleted = {
                    id: alreadySubscribedStripePlanId
                };
                const newPlan = await this.planRepository.findOne({
                    where: {
                        id: purchasePlanDto.newSubscriptionPlanId
                    }
                });
                const currentSubscriptionItem = currentSubscription.items.data[0];
                const datas = await this.stripe.subscriptions.update(alreadySubscribedStripePlanId, {
                    items: [
                        {
                            id: currentSubscriptionItem.id,
                            price: newPlan === null || newPlan === void 0 ? void 0 : newPlan.stripePlanId,
                        },
                    ],
                    proration_behavior: 'none',
                    billing_cycle_anchor: 'now',
                });
                if (datas) {
                    await this.removeUserSubscriptionfromDb(subscriptionDeleted);
                    let savedSubscription = await this.SubscriptionRepository.save({
                        userId: loggedInUserId,
                        planId: newPlan.id,
                        type: newPlan.type,
                        stripeSubscriptionPlanId: datas === null || datas === void 0 ? void 0 : datas.id
                    });
                    let multipleUserSubscriptionArray = purchasePlanDto.customerContactNo.map((value) => {
                        value.userId = loggedInUserId;
                        value.subscriptionId = savedSubscription.id;
                        value.planId = datas.id;
                        return value;
                    });
                    purchasePlanDto.customerContactNo.forEach(async (value) => {
                        const UsersData = await this.UsersRepository.findOne({
                            where: {
                                contactNumber: value.contactNumber,
                                dialCode: value.dialCode,
                            },
                        });
                        if (UsersData) {
                            UsersData.isSubscriptionPurchased = true;
                            await this.UsersRepository.save(UsersData);
                        }
                    });
                    await this.multiUserSubscriptionRepository.save(multipleUserSubscriptionArray);
                    message = `Subscription plan updated sucessfully from ${alreadySubscribedPlan.type} to ${newPlan.type}`;
                    return message;
                }
                else {
                    message = `Failed to update subscription plan`;
                    return message;
                }
            }
        }
        catch (err) {
            console.log("Error is", err);
            throw err;
        }
    }
};
StripeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('STRIPE_KEY')),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __param(2, (0, typeorm_1.InjectRepository)(multipleUserSubscription_entity_1.MultipleUserSubscription)),
    __param(3, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(4, (0, typeorm_1.InjectRepository)(plans_entity_1.Plans)),
    __metadata("design:paramtypes", [String, typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StripeService);
exports.StripeService = StripeService;
//# sourceMappingURL=stripe.service.js.map