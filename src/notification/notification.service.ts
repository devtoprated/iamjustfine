import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import firebaseAdmin from "firebase-admin";
import { In, Not, Repository } from 'typeorm';
import { Notification } from 'src/entity/notification.entity';
import { type } from 'os';
import { NotificationLog } from 'src/entity/notification-log.entity';

@Injectable()
export class NotificationService {

    constructor(
        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        @InjectRepository(NotificationLog)
        private notificationLogRepository: Repository<NotificationLog>,
    ) { }

    async sendPushNotifications(
        obj, deviceType = ""
    ) {
        try {
            let token;

            const options = {
                mutableContent: true,
                category: "new_notification_available",
                contentAvailable: true,
            }

            if (obj.isMultiNotifications) {
                token = obj.toUserObj;
            } else {
                if (obj.toUserObj.isVerified == 1) {
                    token = obj.toUserObj.deviceToken;
                }
            }

            obj.completeObject.name = obj.fromUserObj.name;
            obj.completeObject.fullContactNumber = obj.fromUserObj.fullContactNumber;
            obj.completeObject.picture = obj.fromUserObj.picture;

            //Firebase notification
            if (token) {
                let notificationTitlePayload;

                if (obj.notificationType != "status_flip") {
                    if (obj.notificationType == "checkin"
                        || obj.notificationType == "checkin_alert_to_follower"
                        || obj.notificationType == "no_need_help"
                    ) {
                        notificationTitlePayload = {
                            body: obj.message,
                            title: String(obj.notificationTitle),
                            sound: obj.isUserNotOk == "true" ? "emergency.caf" : "default",
                        }
                    } else {
                        notificationTitlePayload = {
                            body: obj.message,
                            title: String(obj.notificationTitle),
                            sound: "default",
                        }
                    }


                } else {
                    notificationTitlePayload = {}
                }

                let payload;
                console.log("Testing ---------------1111111111111111111111111111111", deviceType)
                if (deviceType == "Android") {
                    console.log("THis is executing................................", deviceType)
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
                    }
                } else {
                    if (notificationTitlePayload.title == "Check in Alert") {
                        notificationTitlePayload.sound = "calltoattention.caf"
                    }
                    console.log(payload, "bvcvhbjnkjbhvgsvbbcdhshjbdshcb-------------------------ELSE------------------- payload")
                    payload = {
                        notification: notificationTitlePayload,
                        data: {
                            'completeObj': `${JSON.stringify(obj.completeObject)}`,
                            'type': String(obj.notificationType),
                            'moduleName': String(obj.moduleName),
                            'severity': String(obj.severity),
                            'isUserNotOk': String(obj.isUserNotOk)
                        }
                    }
                }

                console.log(payload, "++++++++++++++++++++++++++ payload")

                console.log("to push notification", obj.toUserObj);

                firebaseAdmin
                    .messaging()
                    .sendToDevice(token, payload, options)
                    .then(async (response) => {
                        console.log(`Notification Sent: ${response}`);

                        //notification logs tabel enteries for multiNotification false
                        {
                            if (obj.isMultiNotifications != true) {
                                let record = new NotificationLog();
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
        } catch (e) {
            console.log("firebase push notification err", e)
        }
    }

    async normalNotification(obj) {
        try {
            var record = new Notification();
            record.toUserId = obj.toUserId;
            record.fromUserId = obj.fromUserId;
            record.message = obj.message;
            record.type = obj.type;
            record.title = obj.title;
            record.moduleName = obj.moduleName
            this.notificationRepository.save(record);

            //notification logs
            {
                let record = new NotificationLog();
                record.type = obj.type;
                record.toUserId = obj.toUserId;
                record.fromUserId = obj.fromUserId;
                record.notificationType = "normalNotification";
                record.payloadDetail = JSON.stringify(record);
                record.isMainFunctionLog = true;
                record.message = obj.message;
                await this.notificationLogRepository.insert(record);
            }
        } catch (e) {
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
                            id: Not('null')
                        }
                    },
                    relations: {
                        user: true
                    },
                    order: {
                        createdAt: 'DESC',
                    },
                    take: 100,

                })

                await this.notificationRepository.update(
                    { toUserId: loginUser.sub },
                    { isRead: true }
                )

                resolve({
                    status: true,
                    message: `Notification List Fetched Successfully !!`,
                    result: notifcations
                })

            } catch (e) {
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
                })

                resolve({
                    status: true,
                    message: `Notification updated Successfully !!`,
                    result: notifcations
                })

            } catch (e) {
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
                    id: In(req.id)
                })

                resolve({
                    status: true,
                    message: `Notification deleted Successfully !!`,
                    result: notifcations
                })

            } catch (e) {
                console.log("FRRF", e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...' + e
                });
            }
        });
    }
}
