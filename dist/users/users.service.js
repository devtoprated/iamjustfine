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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const health_status_entity_1 = require("../entity/health-status.entity");
const user_entity_1 = require("../entity/user.entity");
const notification_service_1 = require("../notification/notification.service");
const typeorm_2 = require("typeorm");
const invitation_entity_1 = require("../entity/invitation.entity");
const user_monitor_entity_1 = require("../entity/user-monitor.entity");
const notification_entity_1 = require("../entity/notification.entity");
const setting_entity_1 = require("../entity/setting.entity");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const notification_log_entity_1 = require("../entity/notification-log.entity");
const plans_entity_1 = require("../entity/plans.entity");
const multipleUserSubscription_entity_1 = require("../entity/multipleUserSubscription.entity");
const subscription_entity_1 = require("../entity/subscription.entity");
let UsersService = class UsersService {
    constructor(healthRepository, userRespository, invitationRespository, helperRepository, notificationRepository, notificationService, settingRepository, PlansRepository, multiSubscriptionUsersRepository, SubscriptionRepository, notificationLogRepository, connection) {
        this.healthRepository = healthRepository;
        this.userRespository = userRespository;
        this.invitationRespository = invitationRespository;
        this.helperRepository = helperRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.settingRepository = settingRepository;
        this.PlansRepository = PlansRepository;
        this.multiSubscriptionUsersRepository = multiSubscriptionUsersRepository;
        this.SubscriptionRepository = SubscriptionRepository;
        this.notificationLogRepository = notificationLogRepository;
        this.connection = connection;
    }
    async checkin(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log(loginUser, "+============================================");
                let userObj = [];
                let tokens = [];
                let iosTokens = [];
                let androidTokens = [];
                let previousHealthStatus = await this.healthRepository.findOne({
                    where: {
                        isCurrentStatus: true,
                        userId: loginUser.sub
                    },
                    select: ["name", "userId"]
                });
                await this.updateHealthStatus(loginUser.sub);
                let healthObj = { "name": req.name, "detail": req.detail, "userId": loginUser.sub, "isCurrentStatus": true };
                let loginUserObj = await this.userRespository.findOne({ where: { id: loginUser.sub } });
                loginUserObj.lastCheckin = new Date();
                loginUserObj.warningTime = null;
                loginUserObj.severity = 0;
                this.userRespository.save(loginUserObj);
                let currHealth = await this.healthRepository.save(healthObj);
                {
                    let status = (currHealth.name).replace(/\s/g, '').toLowerCase();
                    let todayHealthCount = await this.invitationRespository.query(`
                    SELECT count(id) as count from health_status where userId = "${loginUser.sub}" and name = "${status}" and cast(createdAt as Date) = cast(Now() as Date)`);
                    console.log("todayHealthCount", todayHealthCount, status);
                    if ((currHealth.name).replace(/\s/g, '').toLowerCase() == "notok") {
                        await this.pushNotificationToMyFollowers(loginUser.sub, currHealth);
                    }
                    else if (status == "ok") {
                        {
                            await this.helperRepository.findBy({
                                userId: loginUser.sub
                            }).then(async (result) => {
                                if ((previousHealthStatus != null && (previousHealthStatus.name).replace(/\s/g, '').toLowerCase() == "notok")
                                    || result.length > 0) {
                                    await this.helperRepository.softDelete({
                                        userId: loginUser.sub
                                    });
                                    {
                                        let followerIds = await this.followerList(loginUser.sub);
                                        if (followerIds) {
                                            userObj = await this.userRespository.createQueryBuilder("users")
                                                .where('users.id IN (:...followerId)', {
                                                followerId: followerIds
                                            })
                                                .select(["deviceToken", "id", "deviceType", "isVerified"])
                                                .getRawMany();
                                        }
                                        let notifLogObj = [];
                                        let loginUserData = await this.userRespository.findOne({ where: { id: loginUser.sub } });
                                        let pushNotificationPayload;
                                        let notificationMsg;
                                        let title;
                                        console.log(userObj, "+=======================================userObj");
                                        if (userObj.length > 0 && loginUserData.isSubscriptionPurchased == true) {
                                            Promise.all(userObj.map(async (el, i) => {
                                                if (el.deviceToken) {
                                                    tokens.push(el.deviceToken);
                                                    if (el.isVerified == 1) {
                                                        if (el.deviceType == "Android") {
                                                            androidTokens.push(el.deviceToken);
                                                        }
                                                        else {
                                                            iosTokens.push(el.deviceToken);
                                                        }
                                                    }
                                                    {
                                                        pushNotificationPayload = {
                                                            fromUserObj: loginUserData,
                                                            toUserObj: tokens,
                                                            notificationTitle: title,
                                                            message: notificationMsg,
                                                            completeObject: loginUserData,
                                                            isMultiNotifications: true,
                                                            notificationType: "no_need_help",
                                                            moduleName: "2",
                                                            isUserNotOk: "false"
                                                        };
                                                        notificationMsg = currHealth.detail ? currHealth.detail : "Is doing fine now.";
                                                        title = `${loginUserData.name}`;
                                                        let record = new notification_log_entity_1.NotificationLog();
                                                        record.type = "no_need_help (to all followers of care receiver)";
                                                        record.fromUserId = loginUserData.id;
                                                        record.toUserId = el.id;
                                                        record.notificationType = "pushNotification";
                                                        record.payloadDetail = JSON.stringify(pushNotificationPayload);
                                                        record.message = pushNotificationPayload.message;
                                                        notifLogObj.push(record);
                                                        const notifObj = {
                                                            toUserId: el.id,
                                                            fromUserId: loginUserData.id,
                                                            message: notificationMsg,
                                                            type: 'no_need_help (to all followers of care receiver)',
                                                            title: title,
                                                            moduleName: '2'
                                                        };
                                                        this.notificationService.normalNotification(notifObj);
                                                    }
                                                }
                                            })).then(async () => {
                                                if (androidTokens.length > 0) {
                                                    pushNotificationPayload = {
                                                        fromUserObj: loginUserData,
                                                        toUserObj: androidTokens,
                                                        notificationTitle: title,
                                                        message: notificationMsg,
                                                        completeObject: loginUserData,
                                                        isMultiNotifications: true,
                                                        notificationType: "no_need_help",
                                                        moduleName: "2",
                                                        isUserNotOk: "false"
                                                    };
                                                    await this.notificationService.sendPushNotifications(pushNotificationPayload, "Android");
                                                }
                                                if (iosTokens.length > 0) {
                                                    pushNotificationPayload = {
                                                        fromUserObj: loginUserData,
                                                        toUserObj: iosTokens,
                                                        notificationTitle: title,
                                                        message: notificationMsg,
                                                        completeObject: loginUserData,
                                                        isMultiNotifications: true,
                                                        notificationType: "no_need_help",
                                                        moduleName: "2",
                                                        isUserNotOk: "false"
                                                    };
                                                    await this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");
                                                }
                                                if (notifLogObj.length > 0) {
                                                    try {
                                                        await this.notificationLogRepository.save(notifLogObj);
                                                    }
                                                    catch (err) {
                                                        console.log("error login logs", err);
                                                    }
                                                }
                                                return ({
                                                    status: true,
                                                    message: "You checked in successfully.",
                                                    result: currHealth
                                                });
                                            });
                                        }
                                    }
                                }
                            });
                        }
                        if (todayHealthCount[0].count == 1) {
                            await this.pushNotificationToMyFollowers(loginUser.sub, currHealth);
                        }
                    }
                }
                resolve({
                    status: true,
                    message: "checkin successfully",
                    result: currHealth
                });
            }
            catch (e) {
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        });
    }
    async updateHealthStatus(userId) {
        try {
            return this.healthRepository.update({ userId }, { "isCurrentStatus": false });
        }
        catch (err) {
            console.log("update health err", err);
        }
    }
    async delHealthStatus(userId) {
        try {
            return this.healthRepository.delete({ userId });
        }
        catch (err) {
            console.log("health err", err);
        }
    }
    async getProfile(req, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let profileRecord = null;
                const userId = loginUser.sub;
                let profile = await this.userRespository.createQueryBuilder("users")
                    .leftJoinAndSelect("users.currentStatus", "health_status", "health_status.isCurrentStatus = :isCurrentStatus", {
                    isCurrentStatus: 1
                })
                    .leftJoinAndSelect("users.setting", "setting", "setting.userId = users.id")
                    .where('users.id = :userId', { userId })
                    .getOne();
                const latestHealthStatus = await this.healthRepository.findOne({
                    where: { userId: userId },
                    order: { createdAt: 'DESC' },
                });
                const isPremiumUser = await this.SubscriptionRepository.findOne({
                    where: { userId: userId },
                    relations: ['plan'],
                });
                profile.currentStatus = [latestHealthStatus];
                const notificationCount = await this.notificationRepository.count({
                    where: {
                        toUserId: loginUser.sub,
                        isRead: false
                    }
                });
                const plans = await this.PlansRepository.find({ relations: ['subscriptions'] });
                let usersContact = [];
                let noOfContactsSubscribed = 0;
                const filteredPlans = await Promise.all(plans.map(async (plan) => {
                    const subscriptions = plan.subscriptions.filter(subscription => subscription.userId === userId);
                    if (subscriptions.length > 0) {
                        const subscriptionIds = subscriptions.map(subscription => subscription.id);
                        usersContact = await this.multiSubscriptionUsersRepository.find({
                            where: {
                                userId: userId,
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
                let filteredResult = finalOutput.filter(item => item.noOfContactsSubscribed > 0 && item.usersContact.length > 0);
                if (notificationCount > 100) {
                    await this.connection.query(`DELETE n
                            FROM notifications n
                            LEFT JOIN (
                                SELECT id
                                FROM notifications
                                WHERE toUserId = ${loginUser.sub}
                                ORDER BY createdAt DESC
                                LIMIT 100, 1000000 
                            ) AS to_keep ON n.id = to_keep.id
                            WHERE to_keep.id IS NOT NULL
                            AND n.toUserId = ${loginUser.sub};
                    `);
                }
                if (profile != null) {
                    profileRecord = Object.assign(profile, { notificationCount });
                }
                if (filteredResult != null) {
                    profileRecord.currentSubscription = filteredResult;
                }
                profileRecord.planType = null;
                profileRecord.subscriber = {};
                profileRecord.addedNumbers = 0;
                if (isPremiumUser && isPremiumUser.plan) {
                    profileRecord.planType = isPremiumUser.plan.type;
                    const addedNumbers = await this.multiSubscriptionUsersRepository.count({ where: { subscriptionId: isPremiumUser.id }, });
                    profileRecord.addedNumbers = addedNumbers;
                }
                else {
                    if (profileRecord.isSubscriptionPurchased == true) {
                        const findDetails = await this.multiSubscriptionUsersRepository.findOne({
                            where: {
                                contactNumber: profileRecord.contactNumber,
                                dialCode: profileRecord.dialCode
                            },
                        });
                        const subscriberDetails = await this.SubscriptionRepository.findOne({
                            where: { userId: findDetails.userId },
                            relations: ['plan', 'user'],
                        });
                        profileRecord.subscriber.planType = subscriberDetails.type,
                            profileRecord.subscriber.username = subscriberDetails.user.name;
                    }
                }
                resolve({
                    status: true,
                    message: "Profile information was retrieved successfully.",
                    result: profileRecord,
                    isSubscriptionCheck: true,
                    currentSubscription: filteredResult,
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
    async updateProfile(req, img, res, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const { name, dialCode, contactNumber } = req;
                var isExits = await this.userRespository.findOneById(userId);
                if (isExits) {
                    isExits.picture = img !== null && img !== void 0 ? img : isExits.picture;
                    isExits.name = name !== null && name !== void 0 ? name : isExits.name;
                    isExits.dialCode = dialCode !== null && dialCode !== void 0 ? dialCode : isExits.dialCode;
                    isExits.contactNumber = contactNumber !== null && contactNumber !== void 0 ? contactNumber : isExits.contactNumber;
                    let result = await this.userRespository.save(isExits);
                    resolve({
                        status: true,
                        message: "Profile updated successfully...",
                        result: result
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: "User doesn't exist",
                    });
                }
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
    async changeCheckInStatus(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let userObj;
                const { detail } = req;
                var currHealth = await this.healthRepository.findOne({
                    where: {
                        "userId": loginUser.sub,
                        "isCurrentStatus": true
                    },
                });
                if (currHealth) {
                    currHealth.detail = detail;
                    let result = await this.healthRepository.save(currHealth);
                    let loginUserObj = await this.userRespository.findOne({ where: { id: loginUser.sub } });
                    loginUserObj.lastCheckin = new Date();
                    loginUserObj.warningTime = null;
                    loginUserObj.severity = 0;
                    this.userRespository.save(loginUserObj);
                    {
                        let userObj = await this.getFollowerList(loginUser.sub);
                        console.log("userObj f", userObj);
                        if (userObj.userIds.length > 0) {
                            let tokens = [];
                            let notifLogObj = [];
                            let androidTokens = [];
                            let iosTokens = [];
                            let pushNotificationPayload;
                            let userTokens = await this.userRespository.createQueryBuilder("users")
                                .where('users.id IN (:...colors)', {
                                colors: userObj.userIds
                            })
                                .select(["deviceToken", "deviceType", "isVerified", "id"])
                                .getRawMany();
                            if (userTokens.length > 0 && loginUserObj.isSubscriptionPurchased == true) {
                                Promise.all(userTokens.map((el, i) => {
                                    if (el.deviceToken) {
                                        tokens.push(el.deviceToken);
                                        if (el.isVerified == 1) {
                                            if (el.deviceType == "Android") {
                                                androidTokens.push(el.deviceToken);
                                            }
                                            else {
                                                iosTokens.push(el.deviceToken);
                                            }
                                        }
                                        {
                                            pushNotificationPayload = {
                                                fromUserObj: loginUserObj,
                                                toUserObj: tokens,
                                                notificationTitle: `Status Updated - ${loginUserObj["name"]}`,
                                                message: `${detail}`,
                                                completeObject: loginUserObj,
                                                notificationType: "checkin_alert_to_follower",
                                                moduleName: "2",
                                                isMultiNotifications: true,
                                                isUserNotOk: ((currHealth.name).replace(/\s/g, '').toLowerCase() == "ok") ? "false" : "true"
                                            };
                                            let record = new notification_log_entity_1.NotificationLog();
                                            record.type = "(Update Status Notification )checkin_alert_to_follower";
                                            record.fromUserId = loginUserObj.id;
                                            record.toUserId = el.id;
                                            record.notificationType = "pushNotification";
                                            record.payloadDetail = JSON.stringify(pushNotificationPayload);
                                            record.message = pushNotificationPayload.message;
                                            notifLogObj.push(record);
                                            const notifObj = {
                                                toUserId: el.id,
                                                fromUserId: loginUserObj.id,
                                                message: pushNotificationPayload.message,
                                                type: 'checkin_alert_to_follower',
                                                title: `Status Updated - ${loginUserObj["name"]}`,
                                                moduleName: '2'
                                            };
                                            this.notificationService.normalNotification(notifObj);
                                        }
                                    }
                                })).then(async () => {
                                    console.log({ pushNotificationPayload });
                                    if (androidTokens.length > 0) {
                                        pushNotificationPayload = {
                                            fromUserObj: loginUserObj,
                                            toUserObj: androidTokens,
                                            notificationTitle: `Status Updated - ${loginUserObj["name"]}`,
                                            message: `${detail}`,
                                            completeObject: loginUserObj,
                                            notificationType: "checkin_alert_to_follower",
                                            moduleName: "2",
                                            isMultiNotifications: true,
                                            isUserNotOk: ((currHealth.name).replace(/\s/g, '').toLowerCase() == "ok") ? "false" : "true"
                                        };
                                        this.notificationService.sendPushNotifications(pushNotificationPayload, "Android");
                                    }
                                    if (iosTokens.length > 0) {
                                        pushNotificationPayload = {
                                            fromUserObj: loginUserObj,
                                            toUserObj: iosTokens,
                                            notificationTitle: `Status Updated - ${loginUserObj["name"]}`,
                                            message: `${detail}`,
                                            completeObject: loginUserObj,
                                            notificationType: "checkin_alert_to_follower",
                                            moduleName: "2",
                                            isMultiNotifications: true,
                                            isUserNotOk: ((currHealth.name).replace(/\s/g, '').toLowerCase() == "ok") ? "false" : "true"
                                        };
                                        this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");
                                    }
                                    if (notifLogObj.length > 0) {
                                        try {
                                            await this.notificationLogRepository.save(notifLogObj);
                                        }
                                        catch (err) {
                                            console.log("error login logs", err);
                                        }
                                    }
                                });
                            }
                        }
                    }
                    resolve({
                        status: true,
                        message: "Status updated successfully...",
                        result: result
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: "Please check in First.",
                        result: {}
                    });
                }
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
    async pushNotificationToMyFollowers(loginUserId, currHealth) {
        var _a, _b, _c, _d, _e, _f;
        try {
            let userIds = [];
            let tokens = [];
            let notificationMsg, notificationType;
            let userObj = [];
            let loginUserData = await this.userRespository.findOne({ where: { id: loginUserId } });
            let isUserNotOk = "true";
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${loginUserId}" and i.deletedAt IS NULL`);
            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUserId}" and i.deletedAt IS NULL`);
            if ((_a = myAddedCareGivers[0]) === null || _a === void 0 ? void 0 : _a["ids"]) {
                userIds = ((_b = myAddedCareGivers[0]) === null || _b === void 0 ? void 0 : _b["ids"].split(',')).concat(((_c = otherAddedMeAsCareGiver[0]) === null || _c === void 0 ? void 0 : _c["ids"]) != null ? (_d = otherAddedMeAsCareGiver[0]) === null || _d === void 0 ? void 0 : _d["ids"] : []);
            }
            else {
                if (((_e = otherAddedMeAsCareGiver[0]) === null || _e === void 0 ? void 0 : _e["ids"]) != null) {
                    userIds.push((_f = otherAddedMeAsCareGiver[0]) === null || _f === void 0 ? void 0 : _f["ids"].split(','));
                }
            }
            if (userIds.length > 0) {
                userObj = await this.userRespository.createQueryBuilder("users")
                    .where('users.id IN (:...colors)', {
                    colors: userIds
                })
                    .select(["deviceToken", "id", "deviceType", "isVerified"])
                    .getRawMany();
            }
            let notifLogObj = [];
            let pushNotificationPayload;
            let androidTokens = [];
            let iosTokens = [];
            let message, title;
            if (userObj.length > 0 && loginUserData.isSubscriptionPurchased == true) {
                Promise.all(userObj.map((el, i) => {
                    if (el.deviceToken) {
                        tokens.push(el.deviceToken);
                        if (el.isVerified == 1) {
                            if (el.deviceType == "Android") {
                                androidTokens.push(el.deviceToken);
                            }
                            else {
                                iosTokens.push(el.deviceToken);
                            }
                        }
                        if ((currHealth.name).replace(/\s/g, '').toLowerCase() == "ok") {
                            notificationMsg = currHealth.detail ? currHealth.detail : "Is doing fine today.";
                            isUserNotOk = "false";
                        }
                        else {
                            notificationMsg = currHealth.detail ? currHealth.detail : "Is not doing fine today.";
                        }
                        message = notificationMsg;
                        title = `${loginUserData.name}`;
                        pushNotificationPayload = {
                            fromUserObj: loginUserData,
                            toUserObj: tokens,
                            notificationTitle: title,
                            message: notificationMsg,
                            completeObject: loginUserData,
                            isMultiNotifications: true,
                            notificationType: "checkin",
                            moduleName: "2",
                            isUserNotOk
                        };
                        console.log("herererre", pushNotificationPayload);
                        let record = new notification_log_entity_1.NotificationLog();
                        record.type = "checkin";
                        record.fromUserId = loginUserData.id;
                        record.toUserId = el.id;
                        record.notificationType = "pushNotification";
                        record.payloadDetail = JSON.stringify(pushNotificationPayload);
                        record.message = notificationMsg;
                        notifLogObj.push(record);
                        console.log("record record", pushNotificationPayload);
                        const notifObj = {
                            toUserId: el.id,
                            fromUserId: loginUserData.id,
                            message: notificationMsg,
                            type: 'checkin',
                            title: title,
                            moduleName: '2'
                        };
                        this.notificationService.normalNotification(notifObj);
                    }
                })).then(async () => {
                    if (androidTokens.length > 0) {
                        pushNotificationPayload = {
                            fromUserObj: loginUserData,
                            toUserObj: androidTokens,
                            notificationTitle: title,
                            message: notificationMsg,
                            completeObject: loginUserData,
                            isMultiNotifications: true,
                            notificationType: "checkin",
                            moduleName: "2",
                            isUserNotOk
                        };
                        await this.notificationService.sendPushNotifications(pushNotificationPayload, "Android");
                    }
                    if (iosTokens.length > 0) {
                        pushNotificationPayload = {
                            fromUserObj: loginUserData,
                            toUserObj: iosTokens,
                            notificationTitle: title,
                            message: notificationMsg,
                            completeObject: loginUserData,
                            isMultiNotifications: true,
                            notificationType: "checkin",
                            moduleName: "2",
                            isUserNotOk
                        };
                        await this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");
                    }
                    if (notifLogObj.length > 0) {
                        try {
                            await this.notificationLogRepository.save(notifLogObj);
                        }
                        catch (err) {
                            console.log("error login logs", err);
                        }
                    }
                    return ({
                        status: true,
                        message: "Check-in successfully",
                        result: currHealth
                    });
                });
            }
        }
        catch (err) {
            console.log("push notification checkin err", err);
        }
    }
    async followerList(loginUserId) {
        var _a, _b, _c, _d, _e;
        try {
            let userIds = [];
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${loginUserId}" and i.deletedAt IS NULL`);
            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUserId}" and i.deletedAt IS NULL`);
            if ((_a = myAddedCareGivers[0]) === null || _a === void 0 ? void 0 : _a["ids"]) {
                userIds = ((_b = myAddedCareGivers[0]) === null || _b === void 0 ? void 0 : _b["ids"].split(',')).concat(((_c = otherAddedMeAsCareGiver[0]) === null || _c === void 0 ? void 0 : _c["ids"]) != null ? (_d = otherAddedMeAsCareGiver[0]) === null || _d === void 0 ? void 0 : _d["ids"] : []);
            }
            else {
                userIds.push((_e = otherAddedMeAsCareGiver[0]) === null || _e === void 0 ? void 0 : _e["ids"]);
            }
            let result = userIds[0].split(',');
            return result;
        }
        catch (err) {
            console.log("push notification checkin err", err);
        }
    }
    async logoutUser(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                var isExits = await this.userRespository.findOneById(loginUser.sub);
                if (isExits) {
                    isExits.deviceToken = null;
                    await this.userRespository.save(isExits);
                    resolve({
                        status: true,
                        message: "User logout successfully...",
                        result: isExits
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: "Can't be find this user please try again...",
                        result: {}
                    });
                }
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...',
                    result: {}
                });
            }
        });
    }
    async deleteAccount(loginUser, res) {
        return new Promise(async (resolve, reject) => {
            try {
                const userCheck = await this.userRespository.findOne({
                    where: { id: loginUser }
                });
                const dataToBeRemove = await this.SubscriptionRepository.findOne({
                    where: { userId: userCheck.id }
                });
                const singleUserSubscriptions = await this.multiSubscriptionUsersRepository.findOne({
                    where: {
                        dialCode: userCheck.dialCode,
                        contactNumber: userCheck.contactNumber
                    },
                });
                if (singleUserSubscriptions) {
                    await this.multiSubscriptionUsersRepository.delete({
                        id: singleUserSubscriptions.id,
                    });
                }
                if (dataToBeRemove) {
                    const multipleUserSubscriptions = await this.multiSubscriptionUsersRepository.find({
                        where: { subscriptionId: dataToBeRemove === null || dataToBeRemove === void 0 ? void 0 : dataToBeRemove.id },
                        select: ["dialCode", "contactNumber"],
                    });
                    await multipleUserSubscriptions.map(async (data) => {
                        let userToUpdate = await this.userRespository.findOne({
                            where: {
                                contactNumber: data.contactNumber,
                                dialCode: data === null || data === void 0 ? void 0 : data.dialCode
                            }
                        });
                        if (userToUpdate && (userToUpdate === null || userToUpdate === void 0 ? void 0 : userToUpdate.isSubscriptionPurchased) == true) {
                            userToUpdate.isSubscriptionPurchased = false;
                            await this.userRespository.save(userToUpdate);
                        }
                        ;
                    });
                    await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: dataToBeRemove === null || dataToBeRemove === void 0 ? void 0 : dataToBeRemove.id,
                    });
                    await this.SubscriptionRepository.delete({
                        userId: userCheck.id
                    });
                }
                ;
                await this.healthRepository.softDelete({ userId: loginUser });
                await this.notificationRepository.softDelete({ toUserId: loginUser });
                await this.notificationRepository.softDelete({ fromUserId: loginUser });
                await this.helperRepository.softDelete({ userId: loginUser });
                await this.helperRepository.softDelete({ helperId: loginUser });
                await this.invitationRespository.softDelete({ userId: loginUser });
                await this.invitationRespository.softDelete({ invitedTo: loginUser });
                await this.settingRepository.softDelete({ userId: loginUser });
                await this.userRespository.softDelete({ id: loginUser });
                resolve({
                    status: true,
                    message: "Account deleted successfully...",
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
    async notCheckinUsersCron() {
        try {
            let userListIds = await this.connection.query(`
                                SELECT group_concat(u.id) as ids, group_concat(u.deviceToken) as tokens,group_concat(u.deviceType) as deviceType
                    FROM  users AS u
                        JOIN settings
                            ON u.id = settings.userid
                                AND u.isverified = 1
                                AND Isnull(u.deletedat)
                                AND islogout = 0
                                AND devicetoken IS NOT NULL
                                AND ( Timestampdiff(minute, ( u.lastcheckin ), ( Now() )) >
                                        settings.checkintimeinminutes )
                                AND u.id NOT IN (SELECT users.id
                                                FROM   users
                                                WHERE  islogout = 0
                                                        AND ( ( CURRENT_TIME BETWEEN
                                                                sleepstarttimein24format
                                                                AND
                                                                sleependtimein24format )
                                                            AND ( sleepstarttimein24format >
                                                                    sleependtimein24format )
                                                            OR ( ( CURRENT_TIME >
                                                                    sleepstarttimein24format )
                                                                    AND ( sleepstarttimein24format >
                                                                        sleependtimein24format ) )
                                                            OR ( ( CURRENT_TIME <
                                                                    sleependtimein24format
                                                                    )
                                                                    AND ( sleepstarttimein24format >
                                                                        sleependtimein24format ) )
                                                            OR ( ( CURRENT_TIME BETWEEN
                                                                    sleepstarttimein24format
                                                                    AND
                                                                    sleependtimein24format )
                                                                    AND ( sleepstarttimein24format <
                                                                        sleependtimein24format ) )
                                                            ))
                    `);
            console.log(userListIds[0]["ids"], "=======================++++++++++++++++++++++++=++++++++++++++++++++++++++userListIds");
            if (userListIds[0]["ids"] != null) {
                let usersArray = userListIds[0]["ids"].split(",");
                console.log(usersArray, "+================================================================== usersArray");
                usersArray.forEach(async (value) => {
                    console.log(value, "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ value");
                    let healthObj = {
                        "name": "not ok", "detail": "I am not doing fine.",
                        "userId": value, "isCurrentStatus": true, "isCronGenerated": true
                    };
                    await this.healthRepository.save(healthObj);
                });
                let deviceArray = userListIds[0]["deviceType"].split(",");
                let tokensArray = userListIds[0]["tokens"].split(",");
                let iosTokens = [];
                let androidTokens = [];
                deviceArray.forEach((value, i) => {
                    if (value == "Android") {
                        androidTokens.push(tokensArray[i]);
                    }
                    else {
                        iosTokens.push(tokensArray[i]);
                    }
                });
                let logData = [];
                await Promise.all(userListIds[0]["ids"].split(',').map((el) => {
                    if (el) {
                        let fromUser = {
                            "name": "Admin",
                            "picture": "",
                            "fullContactNumber": ""
                        };
                        const pushNotificationObjData = {
                            fromUserObj: fromUser,
                            toUserObj: userListIds[0]["ids"],
                            notificationTitle: "Check in Alert",
                            message: "You haven't checked in lately. Please check in.",
                            completeObject: fromUser,
                            notificationType: "checkin_alert",
                            moduleName: "1",
                            isMultiNotifications: true
                        };
                        let record = new notification_log_entity_1.NotificationLog();
                        record.type = "checkin_alert";
                        record.toUserId = el;
                        record.notificationType = "pushNotification";
                        record.isSystemNotification = true;
                        record.payloadDetail = JSON.stringify(pushNotificationObjData);
                        record.message = pushNotificationObjData.message;
                        logData.push(record);
                        return `"${el}"`;
                    }
                })).then(async (result) => {
                    console.log({ result });
                    await this.connection.query(`UPDATE users SET lastCheckin = Now(),
                        warningTime = Now(),
                        severity = severity + 1
                        WHERE 
                        id in (${result}) 
                        and isLogout = 0
                        And isNull(users.deletedAt)`);
                    await this.healthRepository.update({ userId: userListIds[0]["ids"] }, { "isCurrentStatus": false });
                    {
                        let fromUser = {
                            "name": "Admin",
                            "picture": "",
                            "fullContactNumber": "",
                            "isSystemNotification": true
                        };
                        if (androidTokens.length > 0) {
                            const pushNotificationObj = {
                                fromUserObj: fromUser,
                                toUserObj: androidTokens,
                                notificationTitle: "Check in Alert",
                                message: "You haven't checked in lately. Please check in.",
                                completeObject: fromUser,
                                notificationType: "checkin_alert",
                                moduleName: "1",
                                isMultiNotifications: true
                            };
                            await this.notificationService.sendPushNotifications(pushNotificationObj, "Android");
                        }
                        if (iosTokens.length > 0) {
                            const pushNotificationObj = {
                                fromUserObj: fromUser,
                                toUserObj: iosTokens,
                                notificationTitle: "Check in Alert",
                                message: "You haven't checked in lately. Please check in.",
                                completeObject: fromUser,
                                notificationType: "checkin_alert",
                                moduleName: "1",
                                isMultiNotifications: true
                            };
                            await this.notificationService.sendPushNotifications(pushNotificationObj, "IOS");
                        }
                    }
                    {
                        try {
                            await this.notificationLogRepository.insert(logData);
                        }
                        catch (err) {
                            console.log("error while insert history logs", err);
                        }
                    }
                });
            }
            let bufferLimitExpiredUsers = await this.connection.query(`
                                SELECT GROUP_CONCAT(users.id) as ids FROM users
                                JOIN settings
                                ON users.id = settings.userid
                                WHERE  
                                    Timestampdiff(minute, (users.warningTime), (Now())) > 30
                                    and users.isVerified = 1 And isNull(users.deletedAt)
                                    and isLogout = 0
                                `);
            let notificationOffUsers = await this.connection.query(`
                                SELECT GROUP_CONCAT(users.id) as ids FROM users
                                JOIN settings
                                ON users.id = settings.userid
                                WHERE  
                                    CURRENT_TIME  BETWEEN sleepStartTimeIn24Format AND sleepEndTimeIn24Format;
                                `);
            if (notificationOffUsers[0]["ids"] != null) {
                this.userRespository.update({ id: (0, typeorm_2.In)(notificationOffUsers[0]["ids"].split(',')) }, { "isNotificationAllowed": false });
            }
            if (bufferLimitExpiredUsers[0]["ids"] != null) {
                let fromUser = {
                    "name": "Admin",
                    "picture": "",
                    "fullContactNumber": "",
                    "isSystemNotification": true
                };
                let toUserObj = await this.userRespository.find({
                    where: {
                        id: (0, typeorm_2.In)(bufferLimitExpiredUsers[0]["ids"].split(',')),
                    },
                });
                for (let i = 0; i < toUserObj.length; i++) {
                    {
                        await this.connection.query(`UPDATE users SET
                        warningTime = null
                        WHERE 
                        id = ("${toUserObj[i]["id"]}") 
                        And isNull(users.deletedAt)`);
                        let healthObj = {
                            "name": "not ok", "detail": "I am not doing fine.",
                            "userId": toUserObj[i]["id"], "isCurrentStatus": true, "isCronGenerated": true
                        };
                        await this.healthRepository.save(healthObj);
                        await this.helperRepository.softDelete({
                            userId: toUserObj[i]["id"]
                        });
                    }
                    {
                        if (toUserObj[i]["deviceToken"] != null) {
                            const pushNotificationObj = {
                                fromUserObj: fromUser,
                                toUserObj: toUserObj[i],
                                notificationTitle: `${toUserObj[i]["name"]}`,
                                message: `I'm not doing fine.`,
                                completeObject: fromUser,
                                notificationType: "status_flip",
                                moduleName: "1"
                            };
                            await this.notificationService.sendPushNotifications(pushNotificationObj);
                        }
                    }
                    {
                        let userObj = await this.getFollowerList(toUserObj[i]["id"]);
                        if (userObj.userIds.length > 0) {
                            let tokens = [];
                            let followerLogs = [];
                            let userTokens = await this.userRespository.createQueryBuilder("users")
                                .where('users.id IN (:...userObjs)', {
                                userObjs: userObj.userIds
                            })
                                .select(["deviceToken", "id", "deviceType", "isVerified"])
                                .getRawMany();
                            if (userTokens.length > 0) {
                                let iosTokens = [];
                                let androidTokens = [];
                                Promise.all(userTokens.map((el) => {
                                    if (el.deviceToken) {
                                        tokens.push(el.deviceToken);
                                        if (el.isVerified == 1) {
                                            if (el.deviceType == "Android") {
                                                androidTokens.push(el.deviceToken);
                                            }
                                            else {
                                                iosTokens.push(el.deviceToken);
                                            }
                                        }
                                    }
                                    const pushNotificationObjData2 = {
                                        fromUserObj: fromUser,
                                        toUserObj: el.id,
                                        notificationTitle: `${toUserObj[i]["name"]}`,
                                        message: `I am not doing fine.`,
                                        completeObject: fromUser,
                                        notificationType: "checkin_alert_to_follower",
                                        moduleName: "2",
                                        isMultiNotifications: true,
                                        isUserNotOk: true
                                    };
                                    let record = new notification_log_entity_1.NotificationLog();
                                    record.type = "checkin_alert_to_follower";
                                    record.toUserId = el.id;
                                    record.fromUserId = toUserObj[i]["id"];
                                    record.payloadDetail = JSON.stringify(pushNotificationObjData2);
                                    record.isSystemNotification = true;
                                    record.message = pushNotificationObjData2.message;
                                    followerLogs.push(record);
                                })).then(async () => {
                                    if (tokens.length > 0) {
                                        if (androidTokens.length > 0) {
                                            const pushNotificationObj = {
                                                fromUserObj: fromUser,
                                                toUserObj: androidTokens,
                                                notificationTitle: `${toUserObj[i]["name"]}`,
                                                message: `I am not doing fine.`,
                                                completeObject: fromUser,
                                                notificationType: "checkin_alert_to_follower",
                                                moduleName: "2",
                                                isMultiNotifications: true,
                                                isUserNotOk: true
                                            };
                                            await this.notificationService.sendPushNotifications(pushNotificationObj, "Android");
                                        }
                                        if (iosTokens.length > 0) {
                                            const pushNotificationObj = {
                                                fromUserObj: fromUser,
                                                toUserObj: iosTokens,
                                                notificationTitle: `${toUserObj[i]["name"]}`,
                                                message: `I am not doing fine.`,
                                                completeObject: fromUser,
                                                notificationType: "checkin_alert_to_follower",
                                                moduleName: "2",
                                                isMultiNotifications: true,
                                                isUserNotOk: true
                                            };
                                            await this.notificationService.sendPushNotifications(pushNotificationObj, "IOS");
                                        }
                                        {
                                            try {
                                                await this.notificationLogRepository.insert(followerLogs);
                                            }
                                            catch (err) {
                                                console.log("error follower history logs", err);
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }
        catch (err) {
            console.log("cron err", err);
        }
    }
    async getUserCount() {
        const count = await this.userRespository.createQueryBuilder('users').getCount();
        return count;
    }
    async getFollowerList(loginUserId) {
        var _a, _b, _c, _d, _e, _f;
        try {
            let userIds = [];
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
            where i.status = "accepted" and i.type = 1 and i.userId = "${loginUserId}" and i.deletedAt IS NULL`);
            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
            where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUserId}" and i.deletedAt IS NULL`);
            if ((_a = myAddedCareGivers[0]) === null || _a === void 0 ? void 0 : _a["ids"]) {
                userIds = ((_b = myAddedCareGivers[0]) === null || _b === void 0 ? void 0 : _b["ids"].split(',')).concat(((_c = otherAddedMeAsCareGiver[0]) === null || _c === void 0 ? void 0 : _c["ids"]) != null ? (_d = otherAddedMeAsCareGiver[0]) === null || _d === void 0 ? void 0 : _d["ids"].split(',') : []);
            }
            else {
                if ((_e = otherAddedMeAsCareGiver[0]) === null || _e === void 0 ? void 0 : _e["ids"]) {
                    userIds.push((_f = otherAddedMeAsCareGiver[0]) === null || _f === void 0 ? void 0 : _f["ids"].split(','));
                }
            }
            console.log("checkin f=debugger", userIds, myAddedCareGivers, otherAddedMeAsCareGiver);
            return {
                userIds: userIds
            };
        }
        catch (err) {
            console.log("push notification checkin err", err);
        }
    }
    async sendDemoPushNotification(dto) {
        try {
            let obj = await this.userRespository.find({
                where: {
                    name: (0, typeorm_2.Not)('')
                }
            });
            if (dto.token) {
                let payload = dto.payload;
                const options = {
                    mutableContent: true,
                    category: "new_notification_available",
                    contentAvailable: true,
                };
                console.log({ payload });
                firebase_admin_1.default
                    .messaging()
                    .sendToDevice(dto.token, payload, options)
                    .then((response) => {
                    console.log(`Notification Sent: ${response}`);
                })
                    .catch((err) => {
                    console.log("Notification error: ", err);
                });
            }
        }
        catch (e) {
            console.log("firebase push notification err", e);
        }
    }
    async deleteUserAccount(contactNumber, dialCode, req, res) {
        try {
            if (!contactNumber || !dialCode) {
                res.json({
                    success: false,
                    result: "Please provide all required fields."
                });
            }
            else {
                const userCheck = await this.userRespository.findOne({
                    where: { contactNumber: contactNumber, dialCode: dialCode }
                });
                const dataToBeRemove = await this.SubscriptionRepository.findOne({
                    where: { userId: userCheck.id }
                });
                const singleUserSubscriptions = await this.multiSubscriptionUsersRepository.findOne({
                    where: {
                        dialCode: userCheck.dialCode,
                        contactNumber: userCheck.contactNumber
                    },
                });
                if (singleUserSubscriptions) {
                    await this.multiSubscriptionUsersRepository.delete({
                        id: singleUserSubscriptions.id,
                    });
                }
                if (dataToBeRemove) {
                    const multipleUserSubscriptions = await this.multiSubscriptionUsersRepository.find({
                        where: { subscriptionId: dataToBeRemove === null || dataToBeRemove === void 0 ? void 0 : dataToBeRemove.id },
                        select: ["dialCode", "contactNumber"],
                    });
                    await multipleUserSubscriptions.map(async (data) => {
                        let userToUpdate = await this.userRespository.findOne({
                            where: {
                                contactNumber: data.contactNumber,
                                dialCode: data === null || data === void 0 ? void 0 : data.dialCode
                            }
                        });
                        if (userToUpdate && (userToUpdate === null || userToUpdate === void 0 ? void 0 : userToUpdate.isSubscriptionPurchased) == true) {
                            userToUpdate.isSubscriptionPurchased = false;
                            await this.userRespository.save(userToUpdate);
                        }
                        ;
                    });
                    await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: dataToBeRemove === null || dataToBeRemove === void 0 ? void 0 : dataToBeRemove.id,
                    });
                    await this.SubscriptionRepository.delete({
                        userId: userCheck.id
                    });
                }
                ;
                if (userCheck) {
                    await this.userRespository.softDelete({ id: userCheck === null || userCheck === void 0 ? void 0 : userCheck.id });
                    res.json({
                        status: true,
                        message: "User account removed successfully.",
                        result: null
                    });
                }
                else {
                    res.json({
                        status: false,
                        message: "User account doesn't exists.",
                        result: null
                    });
                }
            }
        }
        catch (err) {
            console.log("error is", err);
            res.json({
                status: false,
                error: `${err}  Error, please check server logs for more information...`,
                result: null
            });
        }
    }
};
UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(health_status_entity_1.HealthStatus)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __param(2, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __param(3, (0, typeorm_1.InjectRepository)(user_monitor_entity_1.UserMonitor)),
    __param(4, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(6, (0, typeorm_1.InjectRepository)(setting_entity_1.Setting)),
    __param(7, (0, typeorm_1.InjectRepository)(plans_entity_1.Plans)),
    __param(8, (0, typeorm_1.InjectRepository)(multipleUserSubscription_entity_1.MultipleUserSubscription)),
    __param(9, (0, typeorm_1.InjectRepository)(subscription_entity_1.Subscription)),
    __param(10, (0, typeorm_1.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __param(11, (0, typeorm_1.InjectConnection)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Connection])
], UsersService);
exports.UsersService = UsersService;
//# sourceMappingURL=users.service.js.map