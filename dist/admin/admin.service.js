"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const adminpanel_entity_1 = require("../entity/adminpanel.entity");
const bcrypt = __importStar(require("bcrypt"));
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entity/user.entity");
const fs_1 = require("fs");
const csv_parser_1 = __importDefault(require("csv-parser"));
const invitation_entity_1 = require("../entity/invitation.entity");
const plans_entity_1 = require("../entity/plans.entity");
const subscription_entity_1 = require("../entity/subscription.entity");
const multipleUserSubscription_entity_1 = require("../entity/multipleUserSubscription.entity");
const stripe_service_1 = require("../utilities/stripe.service");
let AdminService = class AdminService {
    constructor(adminpanelRepository, userRespository, plansRespository, invitationRespository, SubscriptionRespository, MultipleUserSubscriptionRespository, stripeService) {
        this.adminpanelRepository = adminpanelRepository;
        this.userRespository = userRespository;
        this.plansRespository = plansRespository;
        this.invitationRespository = invitationRespository;
        this.SubscriptionRespository = SubscriptionRespository;
        this.MultipleUserSubscriptionRespository = MultipleUserSubscriptionRespository;
        this.stripeService = stripeService;
    }
    async validateadmin(username, password) {
        const user = await this.adminpanelRepository.findOne({ where: { username } });
        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                return user;
            }
            else {
            }
        }
        return null;
    }
    async adminpanel(adminpanelDto, res) {
        return new Promise(async (resolve, reject) => {
            try {
                const { username, password } = adminpanelDto;
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                const hashedPassword = await bcrypt.hash(password, salt);
                const adminpanel1 = new adminpanel_entity_1.adminpanel();
                adminpanel1.username = username;
                adminpanel1.password = password;
                adminpanel1.password = hashedPassword;
                const set = await this.adminpanelRepository.save(adminpanel1);
                resolve({
                    status: true,
                    message: " admins create successfully...",
                    result: set
                });
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        });
    }
    async getAllUsers() {
        return this.userRespository.find({
            order: {
                createdAt: 'DESC',
            }
        });
    }
    async getAllUsers1() {
        return await this.userRespository.find();
    }
    async userData(userId) {
        return this.userRespository.findOne({ where: { id: userId } });
    }
    async viewsuser(userId) {
        return await this.userRespository.findOne({ where: { id: userId } });
    }
    async followinglist(userId) {
        return await this.userRespository.findOne({ where: { id: userId } });
    }
    async getUserById(userId) {
        return this.userRespository.findOne({ where: { id: userId } });
    }
    async deleteuser(userid) {
        return new Promise(async (resolve, reject) => {
            try {
                const findUser = await this.userRespository.findOne({ where: { id: userid } });
                if (findUser) {
                    const findSingleSubscribedUsers = await this.MultipleUserSubscriptionRespository.findOne({
                        where: {
                            contactNumber: findUser.contactNumber,
                            dialCode: findUser.dialCode
                        }
                    });
                    if (findSingleSubscribedUsers) {
                        await this.MultipleUserSubscriptionRespository.delete({
                            id: findSingleSubscribedUsers.id
                        });
                    }
                }
                const findSubscription = await this.SubscriptionRespository.findOne({ where: { userId: userid } });
                if (findSubscription) {
                    const findSubscribedUsers = await this.MultipleUserSubscriptionRespository.find({
                        where: { subscriptionId: findSubscription.id }
                    });
                    findSubscribedUsers.forEach(async (value) => {
                        const UsersData = await this.userRespository.findOne({
                            where: {
                                contactNumber: value.contactNumber,
                                dialCode: value.dialCode,
                            },
                        });
                        if (UsersData && UsersData.isSubscriptionPurchased == true) {
                            UsersData.isSubscriptionPurchased = false;
                            await this.userRespository.save(UsersData);
                        }
                    });
                    await this.MultipleUserSubscriptionRespository.delete({
                        subscriptionId: findSubscription.id
                    });
                    await this.SubscriptionRespository.delete({ userId: userid });
                }
                await this.userRespository.softDelete({ id: userid });
                resolve({
                    status: true,
                    message: "user deleted successfully...",
                });
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        });
    }
    async isPhoneNumberUnique(phoneNumber) {
        const userWithPhoneNumber = await this.userRespository.findOne({ where: { contactNumber: phoneNumber } });
        return !userWithPhoneNumber;
    }
    async updateUser(userId, EditProfileDto) {
        const user = await this.userRespository.findOne({ where: { id: userId } });
        console.log(EditProfileDto.isApprovedByAdmin + " " + user.isApprovedByAdmin);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        user.name = (EditProfileDto.name).replace(/[`"]/g, '');
        user.contactNumber = EditProfileDto.contactNumber;
        user.dialCode = EditProfileDto.dialCode;
        if (EditProfileDto.isApprovedByAdmin == true) {
            user.isApprovedByAdmin = true;
        }
        else {
            user.isApprovedByAdmin = false;
        }
        return this.userRespository.save(user);
    }
    async saveFollowersList(data) {
        try {
            const newUser = new invitation_entity_1.Invitation();
            newUser.type = data.type;
            if (Array.isArray(data["fromUsers"]) && data["fromUsers"].length > 0) {
                newUser.userId = data["fromUsers"].join(',');
            }
            if (Array.isArray(data["toUsers"]) && data["toUsers"].length > 0) {
                newUser.invitedTo = data["toUsers"].join(',');
            }
            const saveFollowers = await this.invitationRespository.save(newUser);
            return {
                status: true,
                message: 'followers created successfully...',
                result: saveFollowers,
            };
        }
        catch (e) {
            console.error(e);
            return {
                status: false,
                error: 'Error, please check server logs for more information...',
            };
        }
    }
    async addUser(addUserDto, res) {
        try {
            const { name, contactNumber, dialCode, isApprovedByAdmin } = addUserDto;
            const newUser = new user_entity_1.Users();
            newUser.name = name.replace(/[`"]/g, '');
            newUser.contactNumber = contactNumber;
            newUser.dialCode = dialCode;
            newUser.isApprovedByAdmin = isApprovedByAdmin == "0" ? false : true;
            const savedUser = await this.userRespository.save(newUser);
            return {
                status: true,
                message: 'Add user created successfully...',
                result: savedUser,
            };
        }
        catch (e) {
            console.error(e);
            return {
                status: false,
                error: 'Error, please check server logs for more information...',
            };
        }
    }
    async updateUserData(req, res) {
        try {
            let userData = await this.userRespository.findOne({ where: { id: req.body.id } });
            userData.isApprovedByAdmin = (req.body.status == '1') ? true : false;
            await this.userRespository.save(userData);
            return res.json({
                "status": true,
                "message": "Status updated successfully",
                "result": userData
            });
        }
        catch (err) {
            console.log("error while updating status", err);
        }
    }
    async processUserFile(file) {
        const results = [];
        const readStream = (0, fs_1.createReadStream)(file.path);
        return new Promise((resolve, reject) => {
            readStream
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => {
                const newRow = {};
                Object.keys(data).forEach((key) => {
                    const newKey = key.toLowerCase().replace(/[^a-z0-9]+/g, '');
                    newRow[newKey] = data[key];
                });
                results.push(newRow);
            })
                .on('end', async () => {
                try {
                    let uniqueDataCollection = [];
                    const usersToInsert = results.map(async (row) => {
                        let dialCode = row.dialcode.includes('+') ? row.dialcode : `+${row.dialcode}`;
                        await this.userRespository.count({
                            where: [{
                                    dialCode: dialCode,
                                    contactNumber: row.contactnumber,
                                    deletedAt: null
                                }],
                        }).then((res) => {
                            console.log("RE", res);
                            if (res == 0) {
                                return uniqueDataCollection.push({
                                    name: row.name,
                                    contactNumber: row.contactnumber,
                                    dialCode: dialCode,
                                    isApprovedByAdmin: row.status.toLowerCase().replace(/[^a-z0-9]+/g, '') == 'approved' ? true : false,
                                });
                            }
                        });
                    });
                    return await Promise.all(usersToInsert).then((resp) => {
                        if (uniqueDataCollection.length == 0) {
                            resolve('Users already exist in the database');
                        }
                        else {
                            this.userRespository.save(uniqueDataCollection);
                        }
                    }).then(() => {
                        resolve('Users inserted successfully');
                    });
                }
                catch (error) {
                    console.error('Error inserting users:', error);
                    reject('Error while uploading csv');
                }
            })
                .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject('Error reading CSV');
            });
        });
    }
    async addSubscriptionPlan(data, res) {
        try {
            const { price, type } = data;
            const newPlan = new plans_entity_1.Plans();
            newPlan.price = price;
            newPlan.type = type;
            const stripePlan = await this.stripeService.createPlan({
                amount: Math.round(price * 100),
                interval: 'month',
                product: {
                    name: `Plan - ${type}`,
                },
                currency: 'usd',
                nickname: type.toLowerCase(),
            });
            newPlan.stripePlanId = stripePlan.id;
            const savedSubscription = await this.plansRespository.save(newPlan);
            console.log(savedSubscription);
            return {
                status: true,
                message: 'Subscription plan created successfully...',
                result: savedSubscription,
            };
        }
        catch (e) {
            console.error(e);
            return {
                status: false,
                error: 'Error, please check server logs for more information...',
            };
        }
    }
    async getAllSubscriptionPlans() {
        return this.plansRespository.find({
            order: {
                createdAt: 'DESC',
            }
        });
    }
    async planData(planId) {
        return this.plansRespository.findOne({ where: { id: planId } });
    }
    async updateSubscriptionPlan(planId, data) {
        const plan = await this.plansRespository.findOne({ where: { id: planId } });
        plan.type = data.type;
        plan.price = data.price;
        return this.plansRespository.save(plan);
    }
    async viewPlan(userId) {
        return await this.plansRespository.findOne({ where: { id: userId } });
    }
    async deletePlan(planId) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.plansRespository.softDelete({ id: planId });
                resolve({
                    status: true,
                    message: "plan deleted successfully...",
                });
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        });
    }
};
AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(adminpanel_entity_1.adminpanel)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __param(2, (0, typeorm_1.InjectRepository)(plans_entity_1.Plans)),
    __param(3, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __param(4, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(5, (0, typeorm_1.InjectRepository)(multipleUserSubscription_entity_1.MultipleUserSubscription)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        stripe_service_1.StripeService])
], AdminService);
exports.AdminService = AdminService;
//# sourceMappingURL=admin.service.js.map