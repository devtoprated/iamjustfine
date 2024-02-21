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
exports.InvitationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../entity/user.entity");
const typeorm_2 = require("typeorm");
const invitation_entity_1 = require("../entity/invitation.entity");
const notification_service_1 = require("../notification/notification.service");
const { Vonage } = require('@vonage/server-sdk');
const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
});
let InvitationService = class InvitationService {
    constructor(notificationService, userRepository, invitationRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
        this.invitationRepository = invitationRepository;
    }
    async searchContacts(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let unsplitContact, splitContact, rawData, customResonponse, name, otherInvited;
                let userIds = [];
                let othersId = [];
                let contact = req.contact;
                let type = req.type;
                let myInviatedUser = [];
                console.log({ contact });
                if (type == 1) {
                    otherInvited = 2;
                }
                else {
                    otherInvited = 1;
                }
                let otherInvitedMe = await this.invitationRepository.createQueryBuilder("invites")
                    .leftJoinAndSelect("invites.user", "users")
                    .andWhere('invites.invitedTo = :id', {
                    id: loginUser.sub,
                })
                    .andWhere('invites.type = :type', {
                    type: otherInvited,
                })
                    .getMany();
                if (otherInvitedMe.length > 0) {
                    Promise.all(otherInvitedMe.map(async (e) => {
                        othersId.push(e.userId);
                    })).then(async () => {
                        rawData = await this.userRepository.createQueryBuilder('users')
                            .orWhere('name like :name', { "name": '%' + contact + '%' })
                            .orWhere('contactNumber like :contactNumber', { "contactNumber": '%' + contact + '%' })
                            .andWhere({ "id": (0, typeorm_2.Not)(loginUser.sub) })
                            .select('users.id', 'id')
                            .getRawMany();
                        if (rawData.length > 0) {
                            Promise.all(rawData.map(async (e) => {
                                console.log("DD", othersId, (e.id));
                                if (!(othersId.includes(e.id))) {
                                    userIds.push(e.id);
                                }
                            })).then(async () => {
                                if (userIds.length > 0) {
                                    myInviatedUser = await this.invitationRepository.createQueryBuilder("invites")
                                        .leftJoinAndSelect("invites.invitedUser", "invitedUser")
                                        .where('invitedUser.id IN (:...ids)', {
                                        ids: userIds,
                                    })
                                        .andWhere('invites.type = :type', {
                                        type: type,
                                    })
                                        .andWhere('invites.userId = :id', {
                                        id: loginUser.sub,
                                    })
                                        .getMany();
                                }
                                if (myInviatedUser.length == 0) {
                                    let userResponse = [];
                                    if (userIds.length > 0) {
                                        userResponse = await this.userRepository.createQueryBuilder('users')
                                            .where('users.id IN (:...ids)', {
                                            ids: userIds,
                                        })
                                            .getMany();
                                        userResponse.map((el) => {
                                            myInviatedUser.push({
                                                id: "",
                                                status: "",
                                                invitedUser: el
                                            });
                                        });
                                        resolve({
                                            status: true,
                                            message: `User detail fetched successfully !!`,
                                            result: myInviatedUser
                                        });
                                    }
                                    else {
                                        resolve({
                                            status: false,
                                            message: `No user found`,
                                            result: {}
                                        });
                                    }
                                }
                                else {
                                    resolve({
                                        status: true,
                                        message: `User detail fetched successfully !!`,
                                        result: myInviatedUser
                                    });
                                }
                            });
                        }
                        else {
                            resolve({
                                status: false,
                                message: `User does not exist`,
                                result: rawData
                            });
                        }
                    });
                }
                else {
                    rawData = await this.userRepository.createQueryBuilder('users')
                        .orWhere('name like :name', { "name": '%' + contact + '%' })
                        .orWhere('contactNumber like :contactNumber', { "contactNumber": '%' + contact + '%' })
                        .andWhere({ "id": (0, typeorm_2.Not)(loginUser.sub) })
                        .select('users.id', 'id')
                        .getRawMany();
                    if (rawData.length > 0) {
                        Promise.all(rawData.map(async (e) => {
                            userIds.push(e.id);
                        })).then(async () => {
                            let myInviatedUser = await this.invitationRepository.createQueryBuilder("invites")
                                .leftJoinAndSelect("invites.invitedUser", "invitedUser")
                                .where('invitedUser.id IN (:...ids)', {
                                ids: userIds,
                            })
                                .andWhere('invites.type = :type', {
                                type: type,
                            })
                                .andWhere('invites.userId = :id', {
                                id: loginUser.sub,
                            })
                                .getMany();
                            Promise.all(myInviatedUser.map(async (e) => {
                                let indexNo = userIds.indexOf(e.invitedTo);
                                userIds.splice(indexNo, 1);
                                othersId = userIds;
                            })).then(async (res) => {
                                if (othersId.length > 0) {
                                    let userResponse = await this.userRepository.createQueryBuilder('users')
                                        .where('users.id IN (:...ids)', {
                                        ids: othersId,
                                    })
                                        .getMany();
                                    let allData = [];
                                    Promise.all(userResponse.map((el) => {
                                        allData.push({
                                            id: "",
                                            status: "",
                                            invitedUser: el
                                        });
                                    })).then(async () => {
                                        resolve({
                                            status: true,
                                            message: `User detail fetched successfully !!`,
                                            result: allData
                                        });
                                    });
                                }
                                else if (userIds.length > 0) {
                                    let userResponse = await this.userRepository.createQueryBuilder('users')
                                        .where('users.id IN (:...ids)', {
                                        ids: userIds,
                                    })
                                        .getMany();
                                    let allData = [];
                                    Promise.all(userResponse.map((el) => {
                                        allData.push({
                                            id: "",
                                            status: "",
                                            invitedUser: el
                                        });
                                    })).then(async () => {
                                        resolve({
                                            status: true,
                                            message: `User detail fetched successfully !!`,
                                            result: allData
                                        });
                                    });
                                }
                                else {
                                    resolve({
                                        status: false,
                                        message: `User does not exist`,
                                        result: []
                                    });
                                }
                            });
                        });
                    }
                    else {
                        resolve({
                            status: false,
                            message: `User does not exist`,
                            result: rawData
                        });
                    }
                }
            }
            catch (e) {
                console.log("FRRF", e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...' + e
                });
            }
        });
    }
    async inviteUser(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let { type, dialCode, contactNumber, name } = req;
                let existingUser = await this.userRepository.findOne({
                    where: {
                        dialCode: dialCode,
                        contactNumber: contactNumber
                    }
                });
                if (existingUser != null) {
                    let isUserExist = existingUser;
                    if (loginUser.sub == existingUser.id) {
                        resolve({
                            status: false,
                            message: "You can't follow yourself...",
                        });
                    }
                    else {
                        let results = await this.inviteExistingUser(isUserExist, existingUser.id, loginUser, type);
                        resolve(results);
                    }
                }
                else {
                    {
                        let user = new user_entity_1.Users();
                        user.contactNumber = contactNumber;
                        user.dialCode = dialCode;
                        user.isVerified = false;
                        user.name = name !== null && name !== void 0 ? name : "invited user";
                        let saveUser = await this.userRepository.save(user);
                        if (saveUser) {
                            const data = new invitation_entity_1.Invitation();
                            data.userId = loginUser.sub;
                            data.invitedTo = saveUser.id;
                            data.type = type;
                            let result = new invitation_entity_1.Invitation();
                            result = await this.invitationRepository.save(data);
                            let message, title;
                            let fromUser = await this.userRepository.findOne({
                                where: {
                                    id: loginUser.sub
                                }
                            });
                            if (type == 1) {
                                message = `${fromUser.name} want to add you as his follower`;
                                title = `Follow Request`;
                            }
                            else {
                                message = `${fromUser.name} want to follow you`;
                                title = `Follow Request`;
                            }
                            let toUserObj = await this.userRepository.findOne({
                                where: {
                                    id: saveUser.id
                                }
                            });
                            const notifObj = {
                                fromUserId: fromUser.id,
                                toUserId: toUserObj.id,
                                message: message,
                                type: 'request_received',
                                title: title,
                                moduleName: type
                            };
                            console.log("notifObj", notifObj);
                            this.notificationService.normalNotification(notifObj);
                            const from = process.env.VONAGE_FROM_NUMBER;
                            const to = `${saveUser.dialCode.replace("+", "") + saveUser.contactNumber}`;
                            const text = `Hi, someone has sent you a friend request on I'm Just Fine. Please log in to accept the request.

Install the app:

Android - https://play.google.com/store/apps/details?id=com.imjustfine

iOS - https://apps.apple.com/in/app/im-just-fine/id6462395199
                            
Thank you!`;
                            await vonage.sms.send({ to, from, text })
                                .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                                .catch(err => {
                                console.log('There was an error sending the messages.', err["response"]);
                            });
                            result.isUserExist = false;
                            result.isSubscriptionPurchased = false;
                            resolve({
                                status: true,
                                message: `Invitation sent successfully!!`,
                                result: result,
                            });
                        }
                        else {
                            resolve({
                                status: false,
                                message: "Something went wrong.",
                                result: {}
                            });
                        }
                    }
                }
            }
            catch (e) {
                console.log("FRRF", e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...' + e
                });
            }
        });
    }
    async inviteExistingUser(isUserExist, invitedTo, loginUser, type) {
        if (isUserExist) {
            let result;
            let isAlreadyInvited = await this.invitationRepository.findOne({
                where: {
                    invitedTo: invitedTo,
                    userId: loginUser.sub,
                    type: type
                }
            });
            if (isAlreadyInvited) {
                return ({
                    status: false,
                    message: `You have already sent an invitation to ${isUserExist.name}`,
                    result: {}
                });
            }
            else {
                const data = new invitation_entity_1.Invitation();
                data.userId = loginUser.sub;
                data.invitedTo = invitedTo;
                data.type = type;
                if (isAlreadyInvited == null || [isAlreadyInvited].length < 1) {
                    result = await this.invitationRepository.save(data);
                }
                else {
                    result = isAlreadyInvited;
                }
                let message, title;
                let fromUser = await this.userRepository.findOne({
                    where: {
                        id: loginUser.sub
                    }
                });
                if (type == 1) {
                    message = `${fromUser.name} want to add you as his follower`;
                    title = `Follow Request`;
                }
                else {
                    message = `${fromUser.name} want to follow you`;
                    title = `Follow Request`;
                }
                let toUserObj = await this.userRepository.findOne({
                    where: {
                        id: invitedTo
                    }
                });
                const notifObj = {
                    fromUserId: fromUser.id,
                    toUserId: invitedTo,
                    message: message,
                    type: 'request_received',
                    title: title,
                    moduleName: (type == "1") ? "2" : "1"
                };
                console.log("typeeeee", (type == "1") ? "2" : "1");
                const pushNotificationObj = {
                    fromUserObj: fromUser,
                    toUserObj: toUserObj,
                    notificationTitle: title,
                    message: message,
                    completeObject: fromUser,
                    notificationType: "request_received",
                    moduleName: (type == "1") ? "2" : "1"
                };
                this.notificationService.normalNotification(notifObj);
                this.notificationService.sendPushNotifications(pushNotificationObj, toUserObj.deviceType);
                let UserData = {
                    isUserExist: true,
                    isSubscriptionPurchased: toUserObj.isSubscriptionPurchased
                };
                result.isUserExist = true;
                result.isSubscriptionPurchased = toUserObj.isSubscriptionPurchased;
                return ({
                    status: true,
                    message: `Invitation sent successfully to ${isUserExist.name}`,
                    result: result
                });
            }
        }
    }
    async getRequestList(invitationListDto, req, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let { type } = invitationListDto;
                let otherInvited;
                let myInviatedUser = await this.invitationRepository.createQueryBuilder("invites")
                    .leftJoinAndSelect("invites.invitedUser", "invitedUser")
                    .andWhere('invites.type = :type', {
                    type: type,
                })
                    .andWhere('invites.userId = :id', {
                    id: loginUser.sub,
                })
                    .andWhere('invitedUser.id is not null')
                    .getMany();
                if (type == 1) {
                    otherInvited = 2;
                }
                else {
                    otherInvited = 1;
                }
                let OtherinvitedMeUser = await this.invitationRepository.find({
                    where: {
                        invitedTo: loginUser.sub,
                        type: otherInvited,
                        user: {
                            id: (0, typeorm_2.Not)('null')
                        }
                    },
                    select: {
                        "id": true, "status": true
                    },
                    relations: { user: true }
                });
                await Array.prototype.push.apply(myInviatedUser, OtherinvitedMeUser);
                resolve({
                    status: true,
                    message: `Request list fetched successfully !!`,
                    result: myInviatedUser
                });
            }
            catch (e) {
                console.log("FRRF", e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...' + e
                });
            }
        });
    }
    async updateStatus(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let { invitationId, status } = req;
                let invitationExist = await this.invitationRepository.findOne({
                    where: {
                        id: invitationId
                    }
                });
                if (status == "removed" && invitationExist) {
                    invitationExist.status = status;
                    await this.invitationRepository.save(invitationExist);
                    let data = this.invitationRepository.softRemove({
                        id: invitationId
                    });
                    try {
                        let fromUser = await this.userRepository.findOne({
                            where: {
                                id: loginUser.sub
                            }
                        });
                        let toUserID = (invitationExist.userId == loginUser.sub) ? invitationExist.invitedTo : invitationExist.userId;
                        let toUser = await this.userRepository.findOne({
                            where: {
                                id: toUserID
                            }
                        });
                        let message = `${fromUser.name} cancel your follow request`;
                        let title = `Follow Request`;
                        const notifObj = {
                            fromUserId: fromUser.id,
                            toUserId: toUser.id,
                            message: message,
                            type: 'request_accepted',
                            title: title,
                            moduleName: invitationExist.type
                        };
                        let pushNotificationPayload = {
                            fromUserObj: fromUser,
                            toUserObj: toUser,
                            notificationTitle: "Follow Request Cancel",
                            message: message,
                            completeObject: fromUser,
                            isMultiNotifications: false,
                            notificationType: "request_accepted",
                            moduleName: invitationExist.type
                        };
                        this.notificationService.normalNotification(notifObj);
                        console.log("notifObj", notifObj);
                        this.notificationService.sendPushNotifications(pushNotificationPayload, toUser.deviceType);
                    }
                    catch (err) {
                        console.log("revoked notification err", err);
                    }
                    resolve({
                        status: true,
                        message: `Invitation revoked successfully !!`,
                        result: data
                    });
                }
                else if (invitationExist && status != "removed") {
                    invitationExist.status = status;
                    let result = await this.invitationRepository.save(invitationExist);
                    {
                        let message, title, fromUser, toUser;
                        if (invitationExist.userId == loginUser.sub) {
                            fromUser = await this.userRepository.findOne({
                                where: {
                                    id: invitationExist.userId
                                }
                            });
                            toUser = await this.userRepository.findOne({
                                where: {
                                    id: invitationExist.invitedTo
                                }
                            });
                        }
                        else {
                            fromUser = await this.userRepository.findOne({
                                where: {
                                    id: invitationExist.invitedTo
                                }
                            });
                            toUser = await this.userRepository.findOne({
                                where: {
                                    id: invitationExist.userId
                                }
                            });
                        }
                        message = `${fromUser.name} accepted your follow request`;
                        title = `Follow Request`;
                        const notifObj = {
                            fromUserId: fromUser.id,
                            toUserId: toUser.id,
                            message: message,
                            type: 'request_accepted',
                            title: title,
                            moduleName: invitationExist.type
                        };
                        let pushNotificationPayload = {
                            fromUserObj: fromUser,
                            toUserObj: toUser,
                            notificationTitle: "Follow Request Accepted",
                            message: message,
                            completeObject: fromUser,
                            isMultiNotifications: false,
                            notificationType: "request_accepted",
                            moduleName: invitationExist.type
                        };
                        this.notificationService.normalNotification(notifObj);
                        console.log("notifObj", notifObj);
                        this.notificationService.sendPushNotifications(pushNotificationPayload, toUser.deviceType);
                    }
                    resolve({
                        status: true,
                        message: `Invitation accepted successfully !!`,
                        result: result
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: `Inviation does not exist`,
                        result: invitationExist
                    });
                }
            }
            catch (e) {
                console.log("FRRF", e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...' + e
                });
            }
        });
    }
    async dashboardList(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            try {
                let userIds, existingUser;
                let { type } = req;
                let pendingRequest;
                if (type == 1) {
                    let myAddedCareGivers = await this.invitationRepository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${loginUser.sub}" and i.deletedAt IS NULL`);
                    let otherAddedMeAsCareGiver = await this.invitationRepository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUser.sub}" and i.deletedAt IS NULL`);
                    if ((_a = myAddedCareGivers[0]) === null || _a === void 0 ? void 0 : _a["ids"]) {
                        userIds = (_b = myAddedCareGivers[0]) === null || _b === void 0 ? void 0 : _b["ids"].concat(',', (_c = otherAddedMeAsCareGiver[0]) === null || _c === void 0 ? void 0 : _c["ids"]);
                    }
                    else {
                        userIds = (_d = otherAddedMeAsCareGiver[0]) === null || _d === void 0 ? void 0 : _d["ids"];
                    }
                    if (userIds == null) {
                        userIds = '';
                    }
                    pendingRequest = await this.getPendingRequest(type, loginUser);
                    existingUser = await this.userRepository.createQueryBuilder("users")
                        .leftJoinAndSelect("users.helpers", "user_monitors", "user_monitors.userId = :userId", {
                        userId: loginUser.sub
                    })
                        .where('users.id IN (:...userIds)', {
                        userIds: userIds.split(','),
                    })
                        .getMany();
                }
                else {
                    let myAddedMeAsCareReceiver = await this.invitationRepository.query(`select GROUP_CONCAT(i.invitedTo) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.userId = "${loginUser.sub}" and i.deletedAt IS NULL`);
                    let otherAddedMeAsCareReceiver = await this.invitationRepository.query(`select GROUP_CONCAT(i.userId) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.invitedTo = "${loginUser.sub}" and i.deletedAt IS NULL`);
                    if ((_e = myAddedMeAsCareReceiver[0]) === null || _e === void 0 ? void 0 : _e["ids"]) {
                        userIds = (_f = myAddedMeAsCareReceiver[0]) === null || _f === void 0 ? void 0 : _f["ids"].concat(',', (_g = otherAddedMeAsCareReceiver[0]) === null || _g === void 0 ? void 0 : _g["ids"]);
                    }
                    else {
                        userIds = (_h = otherAddedMeAsCareReceiver[0]) === null || _h === void 0 ? void 0 : _h["ids"];
                    }
                    if (userIds == null) {
                        userIds = '';
                    }
                    pendingRequest = await this.getPendingRequest(type, loginUser);
                    existingUser = await this.userRepository.createQueryBuilder("users")
                        .leftJoinAndSelect("users.currentStatus", "health_status", "health_status.isCurrentStatus = :isCurrentStatus", {
                        isCurrentStatus: 1
                    })
                        .leftJoinAndSelect("users.careReceivers", "user_monitors", "user_monitors.userId = users.id")
                        .leftJoinAndSelect("user_monitors.helper", "users as a")
                        .where('users.id IN (:...colors)', {
                        colors: userIds.split(','),
                    })
                        .getMany();
                }
                if (existingUser.length > 0 || pendingRequest.length > 0) {
                    resolve({
                        status: true,
                        message: `Record fetched successfully !!`,
                        result: {
                            "acceptedRequest": existingUser,
                            "pendingRequest": pendingRequest
                        }
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: `No Record Found`,
                        result: {
                            "acceptedRequest": existingUser,
                            "pendingRequest": pendingRequest
                        }
                    });
                }
            }
            catch (e) {
                console.log("FRRF", e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...' + e
                });
            }
        });
    }
    async getPendingRequest(type, loginUser) {
        let otherInvited;
        let myInviatedUser = await this.invitationRepository.createQueryBuilder("invites")
            .leftJoinAndSelect("invites.invitedUser", "invitedUser")
            .andWhere('invites.type = :type', {
            type: type,
        })
            .andWhere('invites.userId = :id', {
            id: loginUser.sub,
        })
            .andWhere('invites.status = :status', {
            status: "pending",
        })
            .andWhere('invitedUser.id is not null')
            .getMany();
        if (type == 1) {
            otherInvited = 2;
        }
        else {
            otherInvited = 1;
        }
        let OtherinvitedMeUser = await this.invitationRepository.find({
            where: {
                invitedTo: loginUser.sub,
                type: otherInvited,
                user: {
                    id: (0, typeorm_2.Not)('null')
                },
                status: "pending"
            },
            select: {
                "id": true, "status": true
            },
            relations: { user: true }
        });
        await Array.prototype.push.apply(myInviatedUser, OtherinvitedMeUser);
        return (myInviatedUser);
    }
};
InvitationService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __param(2, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __metadata("design:paramtypes", [notification_service_1.NotificationService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], InvitationService);
exports.InvitationService = InvitationService;
//# sourceMappingURL=invitation.service.js.map