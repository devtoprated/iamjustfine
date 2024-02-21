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
exports.SubscriptionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("../entity/subscription.entity");
const plans_entity_1 = require("../entity/plans.entity");
const stripe_service_1 = require("../utilities/stripe.service");
const user_entity_1 = require("../entity/user.entity");
const multipleUserSubscription_entity_1 = require("../entity/multipleUserSubscription.entity");
let SubscriptionService = class SubscriptionService {
    constructor(subscriptionRepository, PlansRepository, UsersRepository, multiSubscriptionUsersRepository, stripeService) {
        this.subscriptionRepository = subscriptionRepository;
        this.PlansRepository = PlansRepository;
        this.UsersRepository = UsersRepository;
        this.multiSubscriptionUsersRepository = multiSubscriptionUsersRepository;
        this.stripeService = stripeService;
    }
    async subscriptionPlanList(res, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const plans = await this.PlansRepository.find({ relations: ['subscriptions'] });
                let usersContact = [];
                let noOfContactsSubscribed = 0;
                const filteredPlans = await Promise.all(plans.map(async (plan) => {
                    const subscriptions = plan.subscriptions.filter(subscription => subscription.userId === (user === null || user === void 0 ? void 0 : user.sub));
                    if (subscriptions.length > 0) {
                        const subscriptionIds = subscriptions.map(subscription => subscription.id);
                        usersContact = await this.multiSubscriptionUsersRepository.find({
                            where: {
                                userId: user === null || user === void 0 ? void 0 : user.sub,
                                subscriptionId: (0, typeorm_2.In)(subscriptionIds),
                            },
                            select: ['dialCode', 'contactNumber']
                        });
                        noOfContactsSubscribed = usersContact === null || usersContact === void 0 ? void 0 : usersContact.length;
                        return Object.assign(Object.assign({}, plan), { usersContact, noOfContactsSubscribed });
                    }
                    else {
                        return Object.assign(Object.assign({}, plan), { usersContact, noOfContactsSubscribed });
                    }
                }));
                const finalOutput = await filteredPlans.map((plan) => (Object.assign(Object.assign({}, plan), { subscriptions: undefined })));
                resolve({
                    status: true,
                    message: "Fetched subscription plan list successfully.",
                    result: finalOutput,
                });
            }
            catch (err) {
                console.log(err);
                reject({
                    status: false,
                    error: `${err} Error, please check server logs for more information...`,
                });
            }
        });
    }
    ;
    async purchaseSubscription(req, res, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const USER = req.user;
                const DATA = req.body;
                let metadata = USER;
                let userData = DATA.customerContactNo;
                if (!userData || userData.length == 0) {
                    resolve({
                        status: false,
                        message: "Please provide customer contact details.",
                        result: null,
                    });
                }
                let checkDataExists = await Promise.all(userData.map(async (item) => {
                    const checkifExists = await this.multiSubscriptionUsersRepository.findOne({
                        where: {
                            contactNumber: item.contactNumber,
                            dialCode: item.dialCode,
                        },
                    });
                    if (checkifExists) {
                        resolve({
                            status: false,
                            message: ` ${checkifExists === null || checkifExists === void 0 ? void 0 : checkifExists.dialCode} ${checkifExists === null || checkifExists === void 0 ? void 0 : checkifExists.contactNumber} is already subscribed to a subscription plan please update contactNumber.`,
                            result: null,
                        });
                    }
                    return checkifExists;
                }));
                const customer = await this.stripeService.createCustomer(USER.contactNumber, metadata);
                const user = await this.UsersRepository.findOne({ where: { id: USER.sub } });
                user.customerId = customer.id;
                this.UsersRepository.save(user);
                const plan = await this.PlansRepository.findOne({ where: { id: DATA.subscriptionPlanId } });
                const sessionData = await this.stripeService.createSession(plan.stripePlanId, user, plan, DATA);
                resolve({
                    status: true,
                    message: "Generate payment url successfully.",
                    result: sessionData.url
                });
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
    async cancelSubscription(req, res, subscriptionId) {
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                const loggedInUserId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.sub;
                const findUser = await this.UsersRepository.findOne({
                    where: {
                        id: loggedInUserId
                    }
                });
                const isSubscriptionCheck = await this.subscriptionRepository.findOne({
                    where: {
                        userId: loggedInUserId
                    }
                });
                const findMultiSubscriptionUsersRepository = await this.multiSubscriptionUsersRepository.findOne({
                    where: {
                        dialCode: findUser.dialCode,
                        contactNumber: findUser.contactNumber
                    }
                });
                if (isSubscriptionCheck) {
                    const cancelSubscription = await this.stripeService.cancelUserSubscriptionPlan(isSubscriptionCheck);
                }
                else {
                    if (findMultiSubscriptionUsersRepository) {
                        await this.multiSubscriptionUsersRepository.delete({
                            dialCode: findUser.dialCode,
                            contactNumber: findUser.contactNumber
                        });
                        findUser.isSubscriptionPurchased = false;
                        await this.UsersRepository.save(findUser);
                    }
                }
                resolve({
                    status: true,
                    message: "Cancelled subscription succesfully",
                    result: "Cancelled subscription succesfully"
                });
            }
            catch (err) {
                console.log("Error is===========", err);
                reject({
                    status: false,
                    error: `${err} Error, please check server logs for more information...`,
                });
            }
        });
    }
    updateUserSubscriptionPlan(req, res, subscriptionPlanId, purchasePlanDto) {
        return new Promise(async (resolve, reject) => {
            var _a;
            try {
                const loggedInUserId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.sub;
                const isSubscriptionCheck = await this.subscriptionRepository.findOne({
                    where: {
                        userId: loggedInUserId,
                    },
                });
                const UsersData = await this.UsersRepository.findOne({
                    where: {
                        id: loggedInUserId,
                    },
                });
                if (UsersData && UsersData.isSubscriptionPurchased == true) {
                    UsersData.isSubscriptionPurchased = false;
                    await this.UsersRepository.save(UsersData);
                }
                if (!isSubscriptionCheck) {
                    resolve({
                        status: false,
                        message: "User is not subscribed to any subscription plan.",
                        result: null,
                    });
                }
                else {
                    if (isSubscriptionCheck.planId == purchasePlanDto.newSubscriptionPlanId) {
                        resolve({
                            status: false,
                            message: "You already purchase this plan please select another plan",
                            result: null
                        });
                    }
                    const findnumbers = await this.multiSubscriptionUsersRepository.find({
                        where: {
                            subscriptionId: isSubscriptionCheck.id
                        }
                    });
                    findnumbers.forEach(async (value) => {
                        const UsersData = await this.UsersRepository.findOne({
                            where: {
                                contactNumber: value.contactNumber,
                                dialCode: value.dialCode,
                            },
                        });
                        if (UsersData && UsersData.isSubscriptionPurchased == true) {
                            UsersData.isSubscriptionPurchased = false;
                            await this.UsersRepository.save(UsersData);
                        }
                    });
                    await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: isSubscriptionCheck.id
                    });
                    let userData = purchasePlanDto.customerContactNo;
                    let checkDataExists = await Promise.all(userData.map(async (item) => {
                        const checkifExists = await this.multiSubscriptionUsersRepository.findOne({
                            where: {
                                contactNumber: item.contactNumber,
                                dialCode: item.dialCode,
                            },
                        });
                        if (checkifExists) {
                            resolve({
                                status: false,
                                message: `${checkifExists === null || checkifExists === void 0 ? void 0 : checkifExists.dialCode} ${checkifExists === null || checkifExists === void 0 ? void 0 : checkifExists.contactNumber} is already subscribed to a subscription plan please update contactNumber.`,
                                result: null,
                            });
                        }
                        return checkifExists;
                    }));
                    let hasData = checkDataExists.some((item) => item !== null);
                    if (!hasData) {
                        let alreadySubscribedStripePlanId = isSubscriptionCheck === null || isSubscriptionCheck === void 0 ? void 0 : isSubscriptionCheck.stripeSubscriptionPlanId;
                        let alreadySubscribedPlan = isSubscriptionCheck === null || isSubscriptionCheck === void 0 ? void 0 : isSubscriptionCheck.plan;
                        const updateData = await this.stripeService.updateUserPlan(alreadySubscribedStripePlanId, alreadySubscribedPlan, purchasePlanDto, loggedInUserId);
                        resolve({
                            status: true,
                            message: updateData,
                            result: "updated successfully"
                        });
                    }
                }
            }
            catch (err) {
                console.log("Error is", err);
                reject(err);
            }
        });
    }
    async updateUserinExistingSubscription(req, res, subscriptionId, purchasePlanDto) {
        return new Promise(async (resolve, reject) => {
            try {
                const loggedInUserId = req.user.sub;
                const isSubscriptionCheck = await this.subscriptionRepository.findOne({
                    where: {
                        userId: loggedInUserId,
                    },
                });
                if (!isSubscriptionCheck) {
                    resolve({
                        status: false,
                        message: "User is not subscribed to any subscription plan.",
                        result: null,
                    });
                }
                else {
                    let userData = purchasePlanDto.customerContactNo;
                    const findNumber = await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: isSubscriptionCheck.id
                    });
                    await Promise.all(userData.map(async (item) => {
                        try {
                            console.log("Before trying to update user");
                            await this.UsersRepository.update({ contactNumber: item.contactNumber, dialCode: item.dialCode }, { isSubscriptionPurchased: true });
                            console.log("After trying to update user");
                        }
                        catch (error) {
                            console.error("Error updating user:", error);
                        }
                        let saveData = {
                            userId: loggedInUserId,
                            subscriptionId: isSubscriptionCheck === null || isSubscriptionCheck === void 0 ? void 0 : isSubscriptionCheck.id,
                            contactNumber: item === null || item === void 0 ? void 0 : item.contactNumber,
                            dialCode: item === null || item === void 0 ? void 0 : item.dialCode,
                            planId: isSubscriptionCheck === null || isSubscriptionCheck === void 0 ? void 0 : isSubscriptionCheck.planId
                        };
                        await this.multiSubscriptionUsersRepository.save(saveData);
                    }));
                    resolve({
                        status: true,
                        message: "Contacts inside subscription Updated Successfully.",
                        result: "updated successfully"
                    });
                }
            }
            catch (err) {
                console.log("error is ", err);
                reject({
                    status: false,
                    error: `${err}  Error, please check server logs for more information...`,
                });
            }
        });
    }
    async deleteSubscribedNumber(body, res) {
        try {
            const { customerContactNo } = body;
            const { dialCode, contactNumber } = customerContactNo;
            const findNumber = await this.multiSubscriptionUsersRepository.findOne({
                where: {
                    dialCode: dialCode,
                    contactNumber: contactNumber
                }
            });
            if (findNumber) {
                const findNumber = await this.multiSubscriptionUsersRepository.delete({
                    dialCode: dialCode,
                    contactNumber: contactNumber
                });
                const findUser = await this.UsersRepository.findOne({
                    where: {
                        dialCode: dialCode,
                        contactNumber: contactNumber
                    }
                });
                if (findUser) {
                    findUser.isSubscriptionPurchased = false;
                    await this.UsersRepository.save(findUser);
                }
            }
            return ({
                status: true,
                message: "Number deleted Successfully.",
                result: "updated successfully"
            });
        }
        catch (error) {
            console.log(error);
        }
    }
};
SubscriptionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(1, (0, typeorm_1.InjectRepository)(plans_entity_1.Plans)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __param(3, (0, typeorm_1.InjectRepository)(multipleUserSubscription_entity_1.MultipleUserSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stripe_service_1.StripeService])
], SubscriptionService);
exports.SubscriptionService = SubscriptionService;
//# sourceMappingURL=subscription.service.js.map