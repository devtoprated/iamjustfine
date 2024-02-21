import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { HealthStatus } from 'src/entity/health-status.entity';
import { Users } from 'src/entity/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Brackets, Connection, In, Not, Repository } from 'typeorm';
import { Invitation } from 'src/entity/invitation.entity';
import { UserMonitor } from 'src/entity/user-monitor.entity';
import { Notification } from 'src/entity/notification.entity';
import { Setting } from 'src/entity/setting.entity';
import firebaseAdmin from "firebase-admin";
import * as moment from "moment";
import { NotificationLog } from 'src/entity/notification-log.entity';
import { Plans } from 'src/entity/plans.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';
import { Subscription } from 'src/entity/subscription.entity';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(HealthStatus)
        private healthRepository: Repository<HealthStatus>,

        @InjectRepository(Users)
        private userRespository: Repository<Users>,

        @InjectRepository(Invitation)
        private invitationRespository: Repository<Invitation>,

        @InjectRepository(UserMonitor)
        private helperRepository: Repository<UserMonitor>,

        @InjectRepository(Notification)
        private notificationRepository: Repository<Notification>,
        private notificationService: NotificationService,

        @InjectRepository(Setting)
        private settingRepository: Repository<Setting>,

        @InjectRepository(Plans)
        private PlansRepository: Repository<Plans>,

        @InjectRepository(MultipleUserSubscription)
        private multiSubscriptionUsersRepository: Repository<MultipleUserSubscription>,

        @InjectRepository(Subscription)
        private SubscriptionRepository: Repository<Subscription>,

        @InjectRepository(NotificationLog)
        private notificationLogRepository: Repository<NotificationLog>,
        @InjectConnection() private readonly connection: Connection,



    ) { }

    async checkin(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {

                console.log(loginUser, "+============================================")
                let userObj = [];
                let tokens = [];
                let iosTokens = [];
                let androidTokens = []

                //Previous health status
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

                //Send push notification to all my followers
                {
                    let status = (currHealth.name).replace(/\s/g, '').toLowerCase();

                    let todayHealthCount = await this.invitationRespository.query(`
                    SELECT count(id) as count from health_status where userId = "${loginUser.sub}" and name = "${status}" and cast(createdAt as Date) = cast(Now() as Date)`);

                    console.log("todayHealthCount", todayHealthCount, status)

                    //Get My followers
                    if ((currHealth.name).replace(/\s/g, '').toLowerCase() == "notok") {
                        await this.pushNotificationToMyFollowers(loginUser.sub, currHealth);
                    } else if (status == "ok") {

                        //Delete monitor record of login user
                        {
                            await this.helperRepository.findBy({
                                userId: loginUser.sub
                            }).then(async (result) => {
                                if ((previousHealthStatus != null && (previousHealthStatus.name).replace(/\s/g, '').toLowerCase() == "notok")
                                    || result.length > 0) {

                                    await this.helperRepository.softDelete({
                                        userId: loginUser.sub
                                    })

                                    // Push notification to all followers that we is fine now
                                    {
                                        let followerIds = await this.followerList(loginUser.sub);

                                        if (followerIds) {
                                            userObj = await this.userRespository.createQueryBuilder("users")
                                                .where('users.id IN (:...followerId)', {
                                                    followerId: followerIds
                                                })
                                                .select(["deviceToken", "id", "deviceType", "isVerified"])
                                                .getRawMany()
                                        }

                                        // console.log("checkin f=debugger userObj", userObj)

                                        let notifLogObj = [];
                                        let loginUserData = await this.userRespository.findOne({ where: { id: loginUser.sub } });

                                        let pushNotificationPayload;
                                        let notificationMsg
                                        let title

                                        console.log(userObj, "+=======================================userObj")

                                        if (userObj.length > 0 && loginUserData.isSubscriptionPurchased == true) {
                                            Promise.all(userObj.map(async (el, i) => {
                                                if (el.deviceToken) {
                                                    tokens.push(el.deviceToken);
                                                    if (el.isVerified == 1) {
                                                        if (el.deviceType == "Android") {
                                                            androidTokens.push(el.deviceToken)
                                                        } else {
                                                            iosTokens.push(el.deviceToken)
                                                        }
                                                    }


                                                    //notification log creation
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
                                                        }

                                                        notificationMsg = currHealth.detail ? currHealth.detail : "Is doing fine now.";
                                                        title = `${loginUserData.name}`;

                                                        let record = new NotificationLog();
                                                        record.type = "no_need_help (to all followers of care receiver)";
                                                        record.fromUserId = loginUserData.id;
                                                        record.toUserId = el.id;
                                                        record.notificationType = "pushNotification";
                                                        record.payloadDetail = JSON.stringify(pushNotificationPayload);
                                                        record.message = pushNotificationPayload.message;
                                                        notifLogObj.push(record)


                                                        const notifObj = {
                                                            toUserId: el.id,
                                                            fromUserId: loginUserData.id,
                                                            message: notificationMsg,
                                                            type: 'no_need_help (to all followers of care receiver)',
                                                            title: title,
                                                            moduleName: '2'
                                                        }

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
                                                    }
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
                                                    }
                                                    await this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");
                                                }

                                                //Notification log entries
                                                if (notifLogObj.length > 0) {
                                                    try {
                                                        await this.notificationLogRepository.save(notifLogObj)
                                                    } catch (err) {
                                                        console.log("error login logs", err)
                                                    }
                                                }
                                                return ({
                                                    status: true,
                                                    message: "You checked in successfully.",
                                                    result: currHealth
                                                })
                                            })
                                        }

                                    }
                                }
                            })
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
                })

            } catch (e) {
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }

    async updateHealthStatus(userId) {
        try {
            return this.healthRepository.update(
                { userId },
                { "isCurrentStatus": false }
            )
        } catch (err) {
            console.log("update health err", err);
        }
    }

    // Not in use now
    async delHealthStatus(userId) {
        try {
            return this.healthRepository.delete(
                { userId }
            )
        } catch (err) {
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
                    .getOne()

                const latestHealthStatus = await this.healthRepository.findOne({
                    where: { userId: userId },
                    order: { createdAt: 'DESC' },
                });

                const isPremiumUser = await this.SubscriptionRepository.findOne({
                    where: { userId: userId },
                    relations: ['plan'],
                });

                profile.currentStatus = [latestHealthStatus]
                //Get notification count
                const notificationCount = await this.notificationRepository.count({
                    where: {
                        toUserId: loginUser.sub,
                        isRead: false
                    }
                })

                const plans = await this.PlansRepository.find({ relations: ['subscriptions'] });

                let usersContact = [];
                let noOfContactsSubscribed = 0;
                const filteredPlans = await Promise.all(
                    plans.map(async (plan) => {
                        const subscriptions = plan.subscriptions.filter(subscription => subscription.userId === userId);

                        if (subscriptions.length > 0) {
                            const subscriptionIds = subscriptions.map(subscription => subscription.id);

                            usersContact = await this.multiSubscriptionUsersRepository.find({
                                where: {
                                    userId: userId,
                                    subscriptionId: In(subscriptionIds),
                                },

                                select: ['dialCode', 'contactNumber']
                            });
                            noOfContactsSubscribed = usersContact?.length
                            return { ...plan, usersContact, noOfContactsSubscribed };
                        } else {
                            return { ...plan, usersContact, noOfContactsSubscribed };
                        }
                    })
                );

                const finalOutput = await filteredPlans.map((plan) => ({
                    ...plan,
                    subscriptions: undefined,
                }));
                let filteredResult = finalOutput.filter(item => item.noOfContactsSubscribed > 0 && item.usersContact.length > 0);

                //Delete notifications that are older than 100
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
                    `)
                }

                if (profile != null) {
                    profileRecord = Object.assign(profile, { notificationCount })
                }

                if (filteredResult != null) {
                    profileRecord.currentSubscription = filteredResult
                }

                profileRecord.planType = null
                profileRecord.subscriber = {}
                profileRecord.addedNumbers = 0

                if (isPremiumUser && isPremiumUser.plan) {
                    profileRecord.planType = isPremiumUser.plan.type;
                    const addedNumbers = await this.multiSubscriptionUsersRepository.count({ where: { subscriptionId: isPremiumUser.id }, });
                    profileRecord.addedNumbers = addedNumbers
                } else {

                    if (profileRecord.isSubscriptionPurchased == true) {

                        const findDetails = await this.multiSubscriptionUsersRepository.findOne(
                            {
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
                        profileRecord.subscriber.username = subscriberDetails.user.name

                    }


                }

                resolve({
                    status: true,
                    message: "Profile information was retrieved successfully.",
                    result: profileRecord,
                    isSubscriptionCheck: true,
                    currentSubscription: filteredResult,
                    // latestHealthStatus: latestHealthStatus
                })

            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }

    async updateProfile(req, img, res, userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const { name, dialCode, contactNumber } = req;
                var isExits = await this.userRespository.findOneById(userId);
                if (isExits) {
                    isExits.picture = img ?? isExits.picture;
                    isExits.name = name ?? isExits.name;
                    isExits.dialCode = dialCode ?? isExits.dialCode;
                    isExits.contactNumber = contactNumber ?? isExits.contactNumber;
                    let result = await this.userRespository.save(isExits);

                    resolve({
                        status: true,
                        message: "Profile updated successfully...",
                        result: result
                    })
                } else {
                    resolve({
                        status: false,
                        message: "User doesn't exist",
                    })
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
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

                    //Send push notification to followers about change status
                    {
                        let userObj = await this.getFollowerList(loginUser.sub);
                        console.log("userObj f", userObj)

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
                                        tokens.push(el.deviceToken)
                                        if (el.isVerified == 1) {
                                            if (el.deviceType == "Android") {
                                                androidTokens.push(el.deviceToken)
                                            } else {
                                                iosTokens.push(el.deviceToken)
                                            }
                                        }


                                        //notification log creation
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
                                            }

                                            let record = new NotificationLog();
                                            record.type = "(Update Status Notification )checkin_alert_to_follower";
                                            record.fromUserId = loginUserObj.id;
                                            record.toUserId = el.id;
                                            record.notificationType = "pushNotification";
                                            record.payloadDetail = JSON.stringify(pushNotificationPayload);
                                            record.message = pushNotificationPayload.message;
                                            notifLogObj.push(record)

                                            const notifObj = {
                                                toUserId: el.id,
                                                fromUserId: loginUserObj.id,
                                                message: pushNotificationPayload.message,
                                                type: 'checkin_alert_to_follower',
                                                title: `Status Updated - ${loginUserObj["name"]}`,
                                                moduleName: '2'
                                            }

                                            this.notificationService.normalNotification(notifObj);
                                        }
                                    }
                                })).then(async () => {
                                    console.log({ pushNotificationPayload })

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
                                        }
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
                                        }
                                        this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");

                                    }

                                    if (notifLogObj.length > 0) {
                                        try {
                                            await this.notificationLogRepository.save(notifLogObj)
                                        } catch (err) {
                                            console.log("error login logs", err)
                                        }
                                    }
                                })
                            }
                        }
                    }
                    resolve({
                        status: true,
                        message: "Status updated successfully...",
                        result: result
                    })
                } else {
                    resolve({
                        status: false,
                        message: "Please check in First.",
                        result: {}
                    })
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }

    async pushNotificationToMyFollowers(loginUserId, currHealth) {

        try {

            let userIds = [];
            let tokens = [];
            let notificationMsg, notificationType;
            let userObj = [];
            let loginUserData = await this.userRespository.findOne({ where: { id: loginUserId } });
            let isUserNotOk = "true";

            //My Follower List
            //get my care givers (My Followers)
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${loginUserId}" and i.deletedAt IS NULL`);

            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUserId}" and i.deletedAt IS NULL`);

            if (myAddedCareGivers[0]?.["ids"]) {
                userIds = (myAddedCareGivers[0]?.["ids"].split(',')).concat(otherAddedMeAsCareGiver[0]?.["ids"] != null ? otherAddedMeAsCareGiver[0]?.["ids"] : []);
            } else {
                if (otherAddedMeAsCareGiver[0]?.["ids"] != null) {
                    userIds.push(otherAddedMeAsCareGiver[0]?.["ids"].split(','));
                }
            }

            if (userIds.length > 0) {
                userObj = await this.userRespository.createQueryBuilder("users")
                    .where('users.id IN (:...colors)', {
                        colors: userIds
                    })
                    .select(["deviceToken", "id", "deviceType", "isVerified"])
                    .getRawMany()
            }


            let notifLogObj = [];
            let pushNotificationPayload;
            let androidTokens = [];
            let iosTokens = [];
            let message, title;

            if (userObj.length > 0 && loginUserData.isSubscriptionPurchased == true) {
                Promise.all(userObj.map((el, i) => {
                    if (el.deviceToken) {
                        tokens.push(el.deviceToken)
                        if (el.isVerified == 1) {
                            if (el.deviceType == "Android") {
                                androidTokens.push(el.deviceToken)
                            } else {
                                iosTokens.push(el.deviceToken)
                            }
                        }


                        if ((currHealth.name).replace(/\s/g, '').toLowerCase() == "ok") {
                            notificationMsg = currHealth.detail ? currHealth.detail : "Is doing fine today.";
                            isUserNotOk = "false"
                        } else {
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
                        }

                        console.log("herererre", pushNotificationPayload)

                        let record = new NotificationLog();
                        record.type = "checkin";
                        record.fromUserId = loginUserData.id;
                        record.toUserId = el.id;
                        record.notificationType = "pushNotification";
                        record.payloadDetail = JSON.stringify(pushNotificationPayload);
                        record.message = notificationMsg;
                        notifLogObj.push(record)

                        console.log("record record", pushNotificationPayload)

                        const notifObj = {
                            toUserId: el.id,
                            fromUserId: loginUserData.id,
                            message: notificationMsg,
                            type: 'checkin',
                            title: title,
                            moduleName: '2'
                        }

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
                        }
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
                        }
                        await this.notificationService.sendPushNotifications(pushNotificationPayload, "IOS");
                    }

                    if (notifLogObj.length > 0) {
                        try {
                            await this.notificationLogRepository.save(notifLogObj)
                        } catch (err) {
                            console.log("error login logs", err)
                        }
                    }

                    return ({
                        status: true,
                        message: "Check-in successfully",
                        result: currHealth
                    })
                })
            }

        } catch (err) {
            console.log("push notification checkin err", err);
        }

    }


    async followerList(loginUserId) {
        try {
            let userIds = [];

            //My Follower List
            //get my care givers (My Followers)
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${loginUserId}" and i.deletedAt IS NULL`);

            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUserId}" and i.deletedAt IS NULL`);

            if (myAddedCareGivers[0]?.["ids"]) {
                userIds = (myAddedCareGivers[0]?.["ids"].split(',')).concat(otherAddedMeAsCareGiver[0]?.["ids"] != null ? otherAddedMeAsCareGiver[0]?.["ids"] : []);
            } else {
                userIds.push(otherAddedMeAsCareGiver[0]?.["ids"]);
            }

            let result = userIds[0].split(',')

            return result;
        } catch (err) {
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
                    })
                } else {
                    resolve({
                        status: false,
                        message: "Can't be find this user please try again...",
                        result: {}
                    })
                }

            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...',
                    result: {}
                });
            }
        })
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
                        where: { subscriptionId: dataToBeRemove?.id },
                        select: ["dialCode", "contactNumber"],
                    });

                    await multipleUserSubscriptions.map(async (data) => {
                        let userToUpdate = await this.userRespository.findOne({
                            where: {
                                contactNumber: data.contactNumber,
                                dialCode: data?.dialCode
                            }
                        });
                        if (userToUpdate && userToUpdate?.isSubscriptionPurchased == true) {
                            userToUpdate.isSubscriptionPurchased = false;
                            await this.userRespository.save(userToUpdate)
                        };
                    });


                    await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: dataToBeRemove?.id,
                    });

                    await this.SubscriptionRepository.delete({
                        userId: userCheck.id
                    });
                };

                await this.healthRepository.softDelete({ userId: loginUser })
                await this.notificationRepository.softDelete({ toUserId: loginUser })
                await this.notificationRepository.softDelete({ fromUserId: loginUser })
                await this.helperRepository.softDelete({ userId: loginUser })
                await this.helperRepository.softDelete({ helperId: loginUser })
                await this.invitationRespository.softDelete({ userId: loginUser })
                await this.invitationRespository.softDelete({ invitedTo: loginUser })
                await this.settingRepository.softDelete({ userId: loginUser })
                await this.userRespository.softDelete({ id: loginUser })

                resolve({
                    status: true,
                    message: "Account deleted successfully...",
                })
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }


    async notCheckinUsersCron() {
        try {
            //get users who has not checking after checking time
            /*SELECT GROUP_CONCAT(users.id) as ids FROM users
                    JOIN settings
                     ON users.id = settings.userid
                    WHERE  
                        (Timestampdiff(minute, (users.lastCheckin), (Now())) > settings.checkinTimeInMinutes
                            OR isNULL(users.lastCheckin) 
                        )
                        and users.isVerified = 1 And isNull(users.deletedAt)
                        and isLogout = 0
                        and severity < 6*/


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
                    `)

            console.log(userListIds[0]["ids"], "=======================++++++++++++++++++++++++=++++++++++++++++++++++++++userListIds")

            if (userListIds[0]["ids"] != null) {

                let usersArray = userListIds[0]["ids"].split(",")

                console.log(usersArray, "+================================================================== usersArray")
                usersArray.forEach(async (value) => {


                    console.log(value, "++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ value")

                    let healthObj = {
                        "name": "not ok", "detail": "I am not doing fine.",
                        "userId": value, "isCurrentStatus": true, "isCronGenerated": true
                    };
                    await this.healthRepository.save(healthObj);
                })

                let deviceArray = userListIds[0]["deviceType"].split(",")
                let tokensArray = userListIds[0]["tokens"].split(",")

                let iosTokens = []
                let androidTokens = []

                deviceArray.forEach((value, i) => {
                    if (value == "Android") {
                        androidTokens.push(tokensArray[i])
                    } else {
                        iosTokens.push(tokensArray[i])
                    }
                });

                let logData = [];

                await Promise.all(userListIds[0]["ids"].split(',').map((el) => {
                    if (el) {

                        let fromUser = {
                            "name": "Admin",
                            "picture": "",
                            "fullContactNumber": ""
                        }

                        const pushNotificationObjData = {
                            fromUserObj: fromUser,
                            toUserObj: userListIds[0]["ids"],
                            notificationTitle: "Check in Alert",
                            message: "You haven't checked in lately. Please check in.",
                            completeObject: fromUser,
                            notificationType: "checkin_alert",
                            moduleName: "1",
                            isMultiNotifications: true
                        }

                        //Notification log entries
                        let record = new NotificationLog();
                        record.type = "checkin_alert";
                        record.toUserId = el;
                        record.notificationType = "pushNotification";
                        record.isSystemNotification = true;
                        record.payloadDetail = JSON.stringify(pushNotificationObjData);
                        record.message = pushNotificationObjData.message;
                        logData.push(record)
                        return `"${el}"`
                    }

                })).then(async (result) => {
                    console.log({ result })

                    await this.connection.query(`UPDATE users SET lastCheckin = Now(),
                        warningTime = Now(),
                        severity = severity + 1
                        WHERE 
                        id in (${result}) 
                        and isLogout = 0
                        And isNull(users.deletedAt)`)

                    await this.healthRepository.update(
                        { userId: userListIds[0]["ids"] },
                        { "isCurrentStatus": false }
                    )


                    //Send notification to user
                    {


                        let fromUser = {
                            "name": "Admin",
                            "picture": "",
                            "fullContactNumber": "",
                            "isSystemNotification": true
                        }

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
                            }
                            await this.notificationService.sendPushNotifications(pushNotificationObj, "Android")
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
                            }
                            await this.notificationService.sendPushNotifications(pushNotificationObj, "IOS")
                        }

                    }

                    //Insert in log table
                    {
                        try {
                            await this.notificationLogRepository.insert(logData)
                        } catch (err) {
                            console.log("error while insert history logs", err)
                        }
                    }
                })
            }

            //get user whose buffer time is over
            let bufferLimitExpiredUsers = await this.connection.query(`
                                SELECT GROUP_CONCAT(users.id) as ids FROM users
                                JOIN settings
                                ON users.id = settings.userid
                                WHERE  
                                    Timestampdiff(minute, (users.warningTime), (Now())) > 30
                                    and users.isVerified = 1 And isNull(users.deletedAt)
                                    and isLogout = 0
                                `);

            //set notification allowed status
            let notificationOffUsers = await this.connection.query(`
                                SELECT GROUP_CONCAT(users.id) as ids FROM users
                                JOIN settings
                                ON users.id = settings.userid
                                WHERE  
                                    CURRENT_TIME  BETWEEN sleepStartTimeIn24Format AND sleepEndTimeIn24Format;
                                `);

            if (notificationOffUsers[0]["ids"] != null) {
                this.userRespository.update(
                    { id: In(notificationOffUsers[0]["ids"].split(',')) },
                    { "isNotificationAllowed": false }
                )
            }

            //Send notification to followers and reset his status
            if (bufferLimitExpiredUsers[0]["ids"] != null) {

                let fromUser = {
                    "name": "Admin",
                    "picture": "",
                    "fullContactNumber": "",
                    "isSystemNotification": true
                }

                let toUserObj = await this.userRespository.find({
                    where: {
                        id: In(bufferLimitExpiredUsers[0]["ids"].split(',')),
                    },
                })

                for (let i = 0; i < toUserObj.length; i++) {

                    //Reset last checking record in health status model
                    {
                        await this.connection.query(`UPDATE users SET
                        warningTime = null
                        WHERE 
                        id = ("${toUserObj[i]["id"]}") 
                        And isNull(users.deletedAt)`)

                        let healthObj = {
                            "name": "not ok", "detail": "I am not doing fine.",
                            "userId": toUserObj[i]["id"], "isCurrentStatus": true, "isCronGenerated": true
                        };
                        await this.healthRepository.save(healthObj);

                        //Del helper data
                        await this.helperRepository.softDelete({
                            userId: toUserObj[i]["id"]
                        })
                    }

                    //Send notification to all current user
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
                            }
                            await this.notificationService.sendPushNotifications(pushNotificationObj)
                        }
                    }

                    //send notification to followers
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
                                .getRawMany()

                            if (userTokens.length > 0) {
                                let iosTokens = []
                                let androidTokens = []

                                Promise.all(userTokens.map((el) => {
                                    if (el.deviceToken) {
                                        tokens.push(el.deviceToken)
                                        if (el.isVerified == 1) {
                                            if (el.deviceType == "Android") {
                                                androidTokens.push(el.deviceToken)
                                            } else {
                                                iosTokens.push(el.deviceToken)
                                            }
                                        }

                                    }

                                    //Notification logs
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
                                    }

                                    let record = new NotificationLog();
                                    record.type = "checkin_alert_to_follower";
                                    record.toUserId = el.id;
                                    record.fromUserId = toUserObj[i]["id"];
                                    record.payloadDetail = JSON.stringify(pushNotificationObjData2);
                                    record.isSystemNotification = true;
                                    record.message = pushNotificationObjData2.message;
                                    followerLogs.push(record);

                                })).then(async () => {
                                    if (tokens.length > 0) {
                                        // message: `${toUserObj[i]["name"]} has not checked in today.`,
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
                                            }

                                            await this.notificationService.sendPushNotifications(pushNotificationObj, "Android")
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
                                            }

                                            await this.notificationService.sendPushNotifications(pushNotificationObj, "IOS")
                                        }


                                        //create logs for follower notified
                                        {
                                            try {
                                                await this.notificationLogRepository.insert(followerLogs)
                                            } catch (err) {
                                                console.log("error follower history logs", err)
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.log("cron err", err)
        }
    }


    async getUserCount(): Promise<number> {
        const count = await this.userRespository.createQueryBuilder('users').getCount();
        return count;
    }

    async getFollowerList(loginUserId) {
        try {

            let userIds = [];

            //My Follower List
            //get my care givers (My Followers)
            let myAddedCareGivers = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
            where i.status = "accepted" and i.type = 1 and i.userId = "${loginUserId}" and i.deletedAt IS NULL`);

            let otherAddedMeAsCareGiver = await this.invitationRespository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
            where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUserId}" and i.deletedAt IS NULL`);

            if (myAddedCareGivers[0]?.["ids"]) {
                userIds = (myAddedCareGivers[0]?.["ids"].split(',')).concat(otherAddedMeAsCareGiver[0]?.["ids"] != null ? otherAddedMeAsCareGiver[0]?.["ids"].split(',') : []);
            } else {
                if (otherAddedMeAsCareGiver[0]?.["ids"]) {
                    userIds.push(otherAddedMeAsCareGiver[0]?.["ids"].split(','));
                }
            }

            console.log("checkin f=debugger", userIds, myAddedCareGivers, otherAddedMeAsCareGiver)

            return {
                userIds: userIds
            }

        } catch (err) {
            console.log("push notification checkin err", err);
        }
    }

    async sendDemoPushNotification(
        dto
    ) {
        try {

            let obj = await this.userRespository.find({
                where: {
                    name: Not('')
                }
            })

            //Firebase notification
            if (dto.token) {

                let payload = dto.payload;

                const options = {
                    mutableContent: true,
                    category: "new_notification_available",
                    contentAvailable: true,
                }

                console.log({ payload })


                firebaseAdmin
                    .messaging()
                    .sendToDevice(dto.token, payload, options)
                    .then((response) => {
                        console.log(`Notification Sent: ${response}`);
                    })
                    .catch((err) => {
                        console.log("Notification error: ", err);
                    });
            }
        } catch (e) {
            console.log("firebase push notification err", e)
        }
    }

    async deleteUserAccount(contactNumber: string, dialCode: string, req, res) {

        try {
            if (!contactNumber || !dialCode) {
                res.json({
                    success: false,
                    result: "Please provide all required fields."
                })
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
                        where: { subscriptionId: dataToBeRemove?.id },
                        select: ["dialCode", "contactNumber"],
                    });

                    await multipleUserSubscriptions.map(async (data) => {
                        let userToUpdate = await this.userRespository.findOne({
                            where: {
                                contactNumber: data.contactNumber,
                                dialCode: data?.dialCode
                            }
                        });
                        if (userToUpdate && userToUpdate?.isSubscriptionPurchased == true) {
                            userToUpdate.isSubscriptionPurchased = false;
                            await this.userRespository.save(userToUpdate)
                        };
                    });


                    await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: dataToBeRemove?.id,
                    });

                    await this.SubscriptionRepository.delete({
                        userId: userCheck.id
                    });
                };

                if (userCheck) {
                    await this.userRespository.softDelete({ id: userCheck?.id })

                    res.json({
                        status: true,
                        message: "User account removed successfully.",
                        result: null
                    })
                }
                else {
                    res.json({
                        status: false,
                        message: "User account doesn't exists.",
                        result: null
                    })
                }
            }

        }
        catch (err) {
            console.log("error is", err)
            res.json({
                status: false,
                error: `${err}  Error, please check server logs for more information...`,
                result: null
            })
        }
    }
}
