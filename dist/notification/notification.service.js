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
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../entity/notification.entity");
const notification_log_entity_1 = require("../entity/notification-log.entity");
let NotificationService = class NotificationService {
    constructor(notificationRepository, notificationLogRepository) {
        this.notificationRepository = notificationRepository;
        this.notificationLogRepository = notificationLogRepository;
    }
    async sendPushNotifications(obj, deviceType = "") {
        try {
            let token;
            const options = {
                mutableContent: true,
                category: "new_notification_available",
                contentAvailable: true,
            };
            if (obj.isMultiNotifications) {
                token = obj.toUserObj;
            }
            else {
                if (obj.toUserObj.isVerified == 1) {
                    token = obj.toUserObj.deviceToken;
                }
            }
            obj.completeObject.name = obj.fromUserObj.name;
            obj.completeObject.fullContactNumber = obj.fromUserObj.fullContactNumber;
            obj.completeObject.picture = obj.fromUserObj.picture;
            if (token) {
                let notificationTitlePayload;
                if (obj.notificationType != "status_flip") {
                    if (obj.notificationType == "checkin"
                        || obj.notificationType == "checkin_alert_to_follower"
                        || obj.notificationType == "no_need_help") {
                        notificationTitlePayload = {
                            body: obj.message,
                            title: String(obj.notificationTitle),
                            sound: obj.isUserNotOk == "true" ? "emergency.caf" : "default",
                        };
                    }
                    else {
                        notificationTitlePayload = {
                            body: obj.message,
                            title: String(obj.notificationTitle),
                            sound: "default",
                        };
                    }
                }
                else {
                    notificationTitlePayload = {};
                }
                let payload;
                console.log("Testing ---------------1111111111111111111111111111111", deviceType);
                if (deviceType == "Android") {
                    console.log("THis is executing................................", deviceType);
                    payload = {
                        notification: {},
                        data: {
                            'completeObj': `${JSON.stringify(obj.completeObject)}`,
                            'type': String(obj.notificationType),
                            'moduleName': String(obj.moduleName),
                            'severity': String(obj.severity),
                            'isUserNotOk': String(obj.isUserNotOk),
                            "body": notificationTitlePayload.body,
                            "title": notificationTitlePayload.title,
                            "sound": notificationTitlePayload.sound
                        }
                    };
                }
                else {
                    if (notificationTitlePayload.title == "Check in Alert") {
                        notificationTitlePayload.sound = "calltoattention.caf";
                    }
                    console.log(payload, "bvcvhbjnkjbhvgsvbbcdhshjbdshcb-------------------------ELSE------------------- payload");
                    payload = {
                        notification: notificationTitlePayload,
                        data: {
                            'completeObj': `${JSON.stringify(obj.completeObject)}`,
                            'type': String(obj.notificationType),
                            'moduleName': String(obj.moduleName),
                            'severity': String(obj.severity),
                            'isUserNotOk': String(obj.isUserNotOk)
                        }
                    };
                }
                console.log(payload, "++++++++++++++++++++++++++ payload");
                console.log("to push notification", obj.toUserObj);
                firebase_admin_1.default
                    .messaging()
                    .sendToDevice(token, payload, options)
                    .then(async (response) => {
                    console.log(`Notification Sent: ${response}`);
                    {
                        if (obj.isMultiNotifications != true) {
                            let record = new notification_log_entity_1.NotificationLog();
                            record.type = obj.notificationType;
                            record.toUserId = obj.toUserObj.id;
                            record.fromUserId = obj.fromUserObj.id;
                            record.notificationType = "pushNotification";
                            record.payloadDetail = JSON.stringify(payload);
                            record.isMainFunctionLog = true;
                            record.message = obj.message;
                            if (obj.notificationType != "status_flip") {
                                record.isSystemNotification = true;
                            }
                            await this.notificationLogRepository.insert(record);
                        }
                    }
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
    async normalNotification(obj) {
        try {
            var record = new notification_entity_1.Notification();
            record.toUserId = obj.toUserId;
            record.fromUserId = obj.fromUserId;
            record.message = obj.message;
            record.type = obj.type;
            record.title = obj.title;
            record.moduleName = obj.moduleName;
            this.notificationRepository.save(record);
            {
                let record = new notification_log_entity_1.NotificationLog();
                record.type = obj.type;
                record.toUserId = obj.toUserId;
                record.fromUserId = obj.fromUserId;
                record.notificationType = "normalNotification";
                record.payloadDetail = JSON.stringify(record);
                record.isMainFunctionLog = true;
                record.message = obj.message;
                await this.notificationLogRepository.insert(record);
            }
        }
        catch (e) {
            console.log("store push notification error", e);
        }
    }
    async getNotificationList(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let notifcations = await this.notificationRepository.find({
                    where: {
                        toUserId: loginUser.sub,
                        user: {
                            id: (0, typeorm_2.Not)('null')
                        }
                    },
                    relations: {
                        user: true
                    },
                    order: {
                        createdAt: 'DESC',
                    },
                    take: 100,
                });
                await this.notificationRepository.update({ toUserId: loginUser.sub }, { isRead: true });
                resolve({
                    status: true,
                    message: `Notification List Fetched Successfully !!`,
                    result: notifcations
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
    async readNotification(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let notifcations = await this.notificationRepository.update({
                    id: req.id
                }, {
                    isRead: true
                });
                resolve({
                    status: true,
                    message: `Notification updated Successfully !!`,
                    result: notifcations
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
    async deleteNotification(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let notifcations = await this.notificationRepository.delete({
                    id: (0, typeorm_2.In)(req.id)
                });
                resolve({
                    status: true,
                    message: `Notification deleted Successfully !!`,
                    result: notifcations
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
};
NotificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __param(1, (0, typeorm_1.InjectRepository)(notification_log_entity_1.NotificationLog)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], NotificationService);
exports.NotificationService = NotificationService;
//# sourceMappingURL=notification.service.js.map