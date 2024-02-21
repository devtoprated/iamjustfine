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
exports.UserMonitorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_monitor_entity_1 = require("../entity/user-monitor.entity");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../entity/user.entity");
const notification_service_1 = require("../notification/notification.service");
const invitation_entity_1 = require("../entity/invitation.entity");
const notification_log_entity_1 = require("../entity/notification-log.entity");
let UserMonitorService = class UserMonitorService {
    constructor(monitorRespository, userRespository, notificationService, invitationRespository, notificationLogRepository) {
        this.monitorRespository = monitorRespository;
        this.userRespository = userRespository;
        this.notificationService = notificationService;
        this.invitationRespository = invitationRespository;
        this.notificationLogRepository = notificationLogRepository;
    }
    async addAsHelper(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                const monitorForObj = await this.userRespository.findOne({
                    where: {
                        id: req.followingId
                    }
                });
                if (monitorForObj) {
                    const monitorObj = await this.monitorRespository.findOne({
                        where: {
                            helperId: loginUser.sub,
                            userId: monitorForObj.id
                        }
                    });
                    if (monitorObj) {
                        resolve({
                            status: false,
                            message: `You already taking care of ${monitorForObj.name}`,
                            result: {}
                        });
                    }
                    else {
                        const helperUserObj = await this.userRespository.findOne({
                            where: {
                                id: loginUser.sub
                            }
                        });
                        const usermonitor = new user_monitor_entity_1.UserMonitor();
                        usermonitor.userId = monitorForObj.id;
                        usermonitor.helperId = loginUser.sub;
                        ;
                        let monitor = await this.monitorRespository.save(usermonitor);
                        let notificationTitle = `${helperUserObj.name}`;
                        let notificationMsg = `Is taking care for you`;
                        let pushNotificationPayload = {
                            fromUserObj: helperUserObj,
                            toUserObj: monitorForObj,
                            notificationTitle: notificationTitle,
                            message: notificationMsg,
                            completeObject: helperUserObj,
                            isMultiNotifications: false,
                            notificationType: "added_as_helper",
                            moduleName: "1"
                        };
                        const notifObj = {
                            fromUserId: helperUserObj.id,
                            toUserId: monitorForObj.id,
                            message: notificationMsg,
                            type: 'added_as_helper',
                            title: notificationTitle,
                            moduleName: "1"
                        };
                        await this.notificationService.sendPushNotifications(pushNotificationPayload, monitorForObj.deviceType);
                        await this.notificationService.normalNotification(notifObj);
                        {
                            let tokens = await this.neededPersonFollowerTokens(monitorForObj, loginUser.sub);
                            console.log("become helper", tokens);
                            if (tokens["followersTokens"].length > 0) {
                                let notificationMsg2 = `${helperUserObj.name} is taking care of ${monitorForObj.name} .`;
                                let pushNotificationToAllPayload;
                                if (tokens["androidTokens"].length > 0) {
                                    let pushNotificationToAllPayload = {
                                        fromUserObj: helperUserObj,
                                        toUserObj: tokens["androidTokens"],
                                        notificationTitle: "Taking Care",
                                        message: notificationMsg2,
                                        completeObject: helperUserObj,
                                        isMultiNotifications: true,
                                        notificationType: "added_as_helper",
                                        moduleName: "2"
                                    };
                                    await this.notificationService.sendPushNotifications(pushNotificationToAllPayload, "Android");
                                }
                                if (tokens["iosTokens"].length > 0) {
                                    let pushNotificationToAllPayload = {
                                        fromUserObj: helperUserObj,
                                        toUserObj: tokens["iosTokens"],
                                        notificationTitle: "Taking Care",
                                        message: notificationMsg2,
                                        completeObject: helperUserObj,
                                        isMultiNotifications: true,
                                        notificationType: "added_as_helper",
                                        moduleName: "2"
                                    };
                                    await this.notificationService.sendPushNotifications(pushNotificationToAllPayload, "IOS");
                                }
                                if (tokens["followingIds"].length > 0) {
                                    for (let i = 0; i < tokens["followingIds"].length; i++) {
                                        try {
                                            const notifObj = {
                                                toUserId: tokens["followingIds"][i],
                                                fromUserId: helperUserObj.id,
                                                message: notificationMsg2,
                                                type: 'request_accepted',
                                                title: "added_as_helper",
                                                moduleName: '2'
                                            };
                                            this.notificationService.normalNotification(notifObj);
                                        }
                                        catch (err) {
                                            console.log("error login logs", err);
                                        }
                                    }
                                }
                            }
                        }
                        resolve({
                            status: true,
                            message: `You are now taking care of ${monitorForObj.name}`,
                            result: monitor
                        });
                    }
                }
                else {
                    resolve({
                        status: false,
                        message: "Invalid following detail..",
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
    async stopHelping(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                const monitorObj = await this.monitorRespository.findOne({
                    where: { id: req.monitoringId }
                });
                if (monitorObj) {
                    const careReceiverObj = await this.userRespository.findOne({
                        where: { id: monitorObj.userId }
                    });
                    const helperObj = await this.userRespository.findOne({
                        where: { id: monitorObj.helperId }
                    });
                    let monitor = await this.monitorRespository.softRemove({
                        id: monitorObj.id
                    });
                    let tokens = await this.neededPersonFollowerTokens(careReceiverObj, loginUser.sub);
                    console.log(tokens, "<<<<<<<<, tokens");
                    if (tokens["followersTokens"].length > 0) {
                        let notificationMsg = `Is stop taking care of ${careReceiverObj.name}.`;
                        let notificationTitle = ` ${helperObj.name}`;
                        let pushNotificationPayload;
                        if (tokens["androidTokens"].length > 0) {
                            pushNotificationPayload = {
                                fromUserObj: helperObj,
                                toUserObj: tokens["androidTokens"],
                                notificationTitle: notificationTitle,
                                message: notificationMsg,
                                completeObject: helperObj,
                                isMultiNotifications: true,
                                notificationType: "stop_helping",
                                moduleName: "2"
                            };
                            await this.notificationService.sendPushNotifications(pushNotificationPayload, "Android");
                        }
                        if (tokens["iosTokens"].length > 0) {
                            pushNotificationPayload = {
                                fromUserObj: helperObj,
                                toUserObj: tokens["iosTokens"],
                                notificationTitle: notificationTitle,
                                message: notificationMsg,
                                completeObject: helperObj,
                                isMultiNotifications: true,
                                notificationType: "stop_helping",
                                moduleName: "2"
                            };
                            await this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");
                        }
                        if (tokens["followingIds"].length > 0) {
                            for (let i = 0; i < tokens["followingIds"].length; i++) {
                                try {
                                    const notifObj = {
                                        toUserId: tokens["followingIds"][i],
                                        fromUserId: helperObj.id,
                                        message: notificationMsg,
                                        type: 'stop_helping',
                                        title: notificationTitle,
                                        moduleName: '2'
                                    };
                                    this.notificationService.normalNotification(notifObj);
                                }
                                catch (err) {
                                    console.log("error login logs", err);
                                }
                            }
                        }
                    }
                    if (careReceiverObj.deviceToken != null) {
                        let notificationMsg = `Is stop taking care for you.`;
                        let notificationTitle = `${helperObj.name}`;
                        let pushNotificationPayload = {
                            fromUserObj: helperObj,
                            toUserObj: careReceiverObj,
                            notificationTitle: notificationTitle,
                            message: notificationMsg,
                            completeObject: helperObj,
                            isMultiNotifications: false,
                            notificationType: "stop_helping",
                            moduleName: "1"
                        };
                        await this.notificationService.sendPushNotifications(pushNotificationPayload, careReceiverObj.deviceType);
                    }
                    resolve({
                        status: true,
                        message: `You stop taking care of ${careReceiverObj.name} `,
                        result: monitor
                    });
                }
                else {
                    resolve({
                        status: false,
                        message: "Invalid monitoring detail",
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
    async neededPersonFollowerTokens(careReceiverObj, removeUserFromId) {
        var _a, _b, _c, _d, _e;
        try {
            let userIds = [];
            let followingIds = [];
            let followersTokens = [];
            let androidTokens = [];
            let iosTokens = [];
            let userObj;
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${careReceiverObj.id}" and i.deletedAt IS NULL`);
            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${careReceiverObj.id}" and i.deletedAt IS NULL`);
            if ((_a = myAddedCareGivers[0]) === null || _a === void 0 ? void 0 : _a["ids"]) {
                userIds = ((_b = myAddedCareGivers[0]) === null || _b === void 0 ? void 0 : _b["ids"].split(',')).concat(((_c = otherAddedMeAsCareGiver[0]) === null || _c === void 0 ? void 0 : _c["ids"]) != null ? (_d = otherAddedMeAsCareGiver[0]) === null || _d === void 0 ? void 0 : _d["ids"] : []);
            }
            else {
                userIds.push((_e = otherAddedMeAsCareGiver[0]) === null || _e === void 0 ? void 0 : _e["ids"].split(','));
            }
            if (userIds) {
                userObj = await this.userRespository.createQueryBuilder("users")
                    .where('users.id IN (:...colors)', {
                    colors: userIds
                })
                    .select(["deviceToken", "id", "deviceType", "isVerified"])
                    .getRawMany();
            }
            if (userObj.length > 0) {
                return Promise.all(userObj.map((el) => {
                    if (el.deviceToken && el.id != removeUserFromId) {
                        followingIds.push(el.id);
                        followersTokens.push(el.deviceToken);
                        if (el.isVerified == 1) {
                            if (el.deviceType == "Android") {
                                androidTokens.push(el.deviceToken);
                            }
                            else {
                                iosTokens.push(el.deviceToken);
                            }
                        }
                    }
                })).then(async () => {
                    return { followersTokens, followingIds, androidTokens, iosTokens };
                });
            }
            else {
                return { followersTokens, followingIds, androidTokens, iosTokens };
            }
        }
        catch (err) {
            console.log("push notification checkin err", err);
        }
    }
};
UserMonitorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_monitor_entity_1.UserMonitor)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.Users)),
    __param(3, (0, typeorm_1.InjectRepository)(invitation_entity_1.Invitation)),
    __param(4, (0, typeorm_1.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        notification_service_1.NotificationService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], UserMonitorService);
exports.UserMonitorService = UserMonitorService;
//# sourceMappingURL=user-monitor.service.js.map