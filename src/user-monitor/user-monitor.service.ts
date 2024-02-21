import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserMonitor } from 'src/entity/user-monitor.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/entity/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Invitation } from 'src/entity/invitation.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';

@Injectable()
export class UserMonitorService {

    constructor(
        @InjectRepository(UserMonitor)
        private monitorRespository: Repository<UserMonitor>,
        @InjectRepository(Users)
        private userRespository: Repository<Users>,
        private notificationService: NotificationService,
        @InjectRepository(Invitation)
        private invitationRespository: Repository<Invitation>,
        @InjectRepository(NotificationLog)
        private notificationLogRepository: Repository<NotificationLog>,
    ) { }

    async addAsHelper(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                const monitorForObj = await this.userRespository.findOne({
                    where: {
                        id: req.followingId
                    }
                })

                if (monitorForObj) {
                    const monitorObj = await this.monitorRespository.findOne({
                        where: {
                            helperId: loginUser.sub,
                            userId: monitorForObj.id
                        }
                    })

                    if (monitorObj) {

                        resolve({
                            status: false,
                            message: `You already taking care of ${monitorForObj.name}`,
                            result: {}
                        })

                    } else {
                        const helperUserObj = await this.userRespository.findOne({
                            where: {
                                id: loginUser.sub
                            }
                        })

                        const usermonitor = new UserMonitor();
                        usermonitor.userId = monitorForObj.id;
                        usermonitor.helperId = loginUser.sub;;
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
                        }

                        const notifObj = {
                            fromUserId: helperUserObj.id,
                            toUserId: monitorForObj.id,
                            message: notificationMsg,
                            type: 'added_as_helper',
                            title: notificationTitle,
                            moduleName: "1"
                        }

                        await this.notificationService.sendPushNotifications(pushNotificationPayload, monitorForObj.deviceType);

                        await this.notificationService.normalNotification(notifObj);

                        //Push to other followers
                        {
                            let tokens = await this.neededPersonFollowerTokens(monitorForObj, loginUser.sub);

                            console.log("become helper", tokens)

                            if (tokens["followersTokens"].length > 0) {

                                let notificationMsg2 = `${helperUserObj.name} is taking care of ${monitorForObj.name} .`

                                let pushNotificationToAllPayload
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
                                    }

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
                                    }

                                    await this.notificationService.sendPushNotifications(pushNotificationToAllPayload, "IOS");

                                }

                                //Notification log entries
                                if (tokens["followingIds"].length > 0) {

                                    for (let i = 0; i < tokens["followingIds"].length; i++) {
                                        try {
                                            // let record = new NotificationLog();
                                            // record.type = "added_as_helper (goes to followers of care receiver)";
                                            // record.fromUserId = helperUserObj.id;
                                            // record.toUserId = tokens["followingIds"][i];
                                            // record.notificationType = "pushNotification";
                                            // record.payloadDetail = JSON.stringify(pushNotificationToAllPayload);
                                            // await this.notificationLogRepository.insert(record)

                                            const notifObj = {
                                                toUserId: tokens["followingIds"][i],
                                                fromUserId: helperUserObj.id,
                                                message: notificationMsg2,
                                                type: 'request_accepted',
                                                title: "added_as_helper",
                                                moduleName: '2'
                                            }

                                            this.notificationService.normalNotification(notifObj);

                                        } catch (err) {
                                            console.log("error login logs", err)
                                        }
                                    }
                                }
                            }
                        }

                        resolve({
                            status: true,
                            message: `You are now taking care of ${monitorForObj.name}`,
                            result: monitor
                        })
                    }
                } else {
                    resolve({
                        status: false,
                        message: "Invalid following detail..",
                        result: {}
                    })
                }
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }

    async stopHelping(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {

                const monitorObj = await this.monitorRespository.findOne({
                    where: { id: req.monitoringId }
                })

                if (monitorObj) {
                    const careReceiverObj = await this.userRespository.findOne({
                        where: { id: monitorObj.userId }
                    })

                    const helperObj = await this.userRespository.findOne({
                        where: { id: monitorObj.helperId }
                    })

                    let monitor = await this.monitorRespository.softRemove({
                        id: monitorObj.id
                    });

                    let tokens = await this.neededPersonFollowerTokens(careReceiverObj, loginUser.sub)

                    console.log(tokens, "<<<<<<<<, tokens")

                    if (tokens["followersTokens"].length > 0) {
                        let notificationMsg = `Is stop taking care of ${careReceiverObj.name}.`
                        let notificationTitle = ` ${helperObj.name}`
                        let pushNotificationPayload

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
                            }

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
                            }

                            await this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");



                        }

                        //Notification log entries
                        if (tokens["followingIds"].length > 0) {

                            for (let i = 0; i < tokens["followingIds"].length; i++) {
                                try {
                                    // let record = new NotificationLog();
                                    // record.type = "stop_helping (goes to followers of care receiver)";
                                    // record.fromUserId = helperObj.id;
                                    // record.toUserId = tokens["followingIds"][i];
                                    // record.notificationType = "pushNotification";
                                    // record.payloadDetail = JSON.stringify(pushNotificationPayload);
                                    // await this.notificationLogRepository.insert(record)


                                    const notifObj = {
                                        toUserId: tokens["followingIds"][i],
                                        fromUserId: helperObj.id,
                                        message: notificationMsg,
                                        type: 'stop_helping',
                                        title: notificationTitle,
                                        moduleName: '2'
                                    }

                                    this.notificationService.normalNotification(notifObj);
                                } catch (err) {
                                    console.log("error login logs", err)
                                }
                            }
                        }
                    }

                    if (careReceiverObj.deviceToken != null) {
                        let notificationMsg = `Is stop taking care for you.`
                        let notificationTitle = `${helperObj.name}`

                        let pushNotificationPayload = {
                            fromUserObj: helperObj,
                            toUserObj: careReceiverObj,
                            notificationTitle: notificationTitle,
                            message: notificationMsg,
                            completeObject: helperObj,
                            isMultiNotifications: false,
                            notificationType: "stop_helping",
                            moduleName: "1"
                        }

                        await this.notificationService.sendPushNotifications(pushNotificationPayload, careReceiverObj.deviceType);


                    }

                    resolve({
                        status: true,
                        message: `You stop taking care of ${careReceiverObj.name} `,
                        result: monitor
                    })
                } else {
                    resolve({
                        status: false,
                        message: "Invalid monitoring detail",
                        result: {}
                    })
                }
            }
            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });

            }
        })
    }

    async neededPersonFollowerTokens(careReceiverObj, removeUserFromId) {
        try {


            let userIds = [];
            let followingIds = [];
            let followersTokens = [];
            let androidTokens = [];
            let iosTokens = []
            let userObj;

            //My Follower List
            //get my care givers (My Followers)
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${careReceiverObj.id}" and i.deletedAt IS NULL`);

            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${careReceiverObj.id}" and i.deletedAt IS NULL`);


            if (myAddedCareGivers[0]?.["ids"]) {
                userIds = (myAddedCareGivers[0]?.["ids"].split(',')).concat(otherAddedMeAsCareGiver[0]?.["ids"] != null ? otherAddedMeAsCareGiver[0]?.["ids"] : []);
            } else {
                userIds.push(otherAddedMeAsCareGiver[0]?.["ids"].split(','));
            }

            if (userIds) {
                userObj = await this.userRespository.createQueryBuilder("users")
                    .where('users.id IN (:...colors)', {
                        colors: userIds
                    })
                    .select(["deviceToken", "id", "deviceType", "isVerified"])
                    .getRawMany()
            }

            if (userObj.length > 0) {
                return Promise.all(userObj.map((el) => {

                    if (el.deviceToken && el.id != removeUserFromId) {
                        followingIds.push(el.id)
                        followersTokens.push(el.deviceToken);

                        if (el.isVerified == 1) {
                            if (el.deviceType == "Android") {
                                androidTokens.push(el.deviceToken)
                            } else {
                                iosTokens.push(el.deviceToken)
                            }
                        }

                    }
                })).then(async () => {
                    return { followersTokens, followingIds, androidTokens, iosTokens }
                })

            } else {
                return { followersTokens, followingIds, androidTokens, iosTokens }
            }
        } catch (err) {
            console.log("push notification checkin err", err);
        }
    }
}
