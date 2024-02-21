import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/entity/user.entity';
import { In, Not, Repository } from 'typeorm';
import { Invitation } from '../entity/invitation.entity';
import { NotificationService } from 'src/notification/notification.service';
import { IsNotIn } from 'class-validator';
// const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
})

@Injectable()
export class InvitationService {
    constructor(
        private notificationService: NotificationService,
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        @InjectRepository(Invitation)
        private invitationRepository: Repository<Invitation>
    ) { }


    async searchContacts(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let unsplitContact, splitContact, rawData, customResonponse, name, otherInvited;
                let userIds = [];

                let othersId = [];

                let contact = req.contact;
                let type = req.type;
                let myInviatedUser = [];

                console.log({ contact })

                if (type == 1) {
                    otherInvited = 2;
                } else {
                    otherInvited = 1
                }

                let otherInvitedMe: any = await this.invitationRepository.createQueryBuilder("invites")
                    .leftJoinAndSelect("invites.user", "users")
                    .andWhere('invites.invitedTo = :id', {
                        id: loginUser.sub,
                    })
                    .andWhere('invites.type = :type', {
                        type: otherInvited,
                    })
                    .getMany()

                if (otherInvitedMe.length > 0) {
                    Promise.all(otherInvitedMe.map(async (e) => {
                        othersId.push(e.userId)
                    })).then(async () => {
                        rawData = await this.userRepository.createQueryBuilder('users')
                            .orWhere('name like :name', { "name": '%' + contact + '%' })
                            .orWhere('contactNumber like :contactNumber', { "contactNumber": '%' + contact + '%' })
                            .andWhere({ "id": Not(loginUser.sub) })
                            .select('users.id', 'id')
                            .getRawMany();

                        if (rawData.length > 0) {
                            Promise.all(rawData.map(async (e) => {

                                console.log("DD", othersId, (e.id));
                                if (!(othersId.includes(e.id))) {
                                    userIds.push(e.id)
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
                                            })
                                        })

                                        resolve({
                                            status: true,
                                            message: `User detail fetched successfully !!`,
                                            result: myInviatedUser
                                        })
                                    } else {
                                        resolve({
                                            status: false,
                                            message: `No user found`,
                                            result: {}
                                        })
                                    }
                                } else {
                                    resolve({
                                        status: true,
                                        message: `User detail fetched successfully !!`,
                                        result: myInviatedUser
                                    })
                                }
                            })
                        } else {
                            resolve({
                                status: false,
                                message: `User does not exist`,
                                result: rawData
                            })
                        }
                    })
                } else {
                    rawData = await this.userRepository.createQueryBuilder('users')
                        .orWhere('name like :name', { "name": '%' + contact + '%' })
                        .orWhere('contactNumber like :contactNumber', { "contactNumber": '%' + contact + '%' })
                        .andWhere({ "id": Not(loginUser.sub) })
                        .select('users.id', 'id')
                        .getRawMany();

                    if (rawData.length > 0) {
                        Promise.all(rawData.map(async (e) => {
                            userIds.push(e.id)
                        })).then(async () => {


                            let myInviatedUser: any = await this.invitationRepository.createQueryBuilder("invites")
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

                            //Remove invited user record
                            Promise.all(myInviatedUser.map(async (e) => {
                                let indexNo = userIds.indexOf(e.invitedTo);
                                userIds.splice(indexNo, 1);
                                othersId = userIds

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
                                        })
                                    })).then(async () => {
                                        resolve({
                                            status: true,
                                            message: `User detail fetched successfully !!`,
                                            result: allData
                                        })
                                    })
                                } else if (userIds.length > 0) {
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
                                        })
                                    })).then(async () => {
                                        resolve({
                                            status: true,
                                            message: `User detail fetched successfully !!`,
                                            result: allData
                                        })
                                    })
                                } else {
                                    resolve({
                                        status: false,
                                        message: `User does not exist`,
                                        result: []
                                    })
                                }
                            })
                        })
                    } else {
                        resolve({
                            status: false,
                            message: `User does not exist`,
                            result: rawData
                        })
                    }
                }
            } catch (e) {
                console.log("FRRF", e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...' + e
                });
            }
        });
    }

    async inviteUser(req, res, loginUser,) {
        return new Promise(async (resolve, reject) => {
            try {

                let { type, dialCode, contactNumber, name } = req;

                let existingUser = await this.userRepository.findOne({
                    where: {
                        dialCode: dialCode,
                        contactNumber: contactNumber
                    }
                })

                if (existingUser != null) {
                    let isUserExist = existingUser

                    if (loginUser.sub == existingUser.id) {
                        resolve({
                            status: false,
                            message: "You can't follow yourself...",
                        })
                    } else {
                        let results = await this.inviteExistingUser(isUserExist, existingUser.id, loginUser, type);

                        resolve(
                            results
                        )
                    }

                } else {
                    //create user
                    {
                        let user = new Users();
                        user.contactNumber = contactNumber;
                        user.dialCode = dialCode;
                        user.isVerified = false;
                        user.name = name ?? "invited user";
                        let saveUser = await this.userRepository.save(user);

                        if (saveUser) {
                            const data = new Invitation();
                            data.userId = loginUser.sub;
                            data.invitedTo = saveUser.id;
                            data.type = type;
                            let result = new Invitation()
                            result = await this.invitationRepository.save(data);

                            //send invitation msg
                            /*await client.messages.create({
                                body: `You are invited to join IamJustFine app by user ${loginUser.name}. Please use below apps to login.`,
                                from: process.env.TWILIO_FROM_NUMBER,
                                to: `${dialCode + contactNumber}`,
                            });*/


                            let message, title;

                            let fromUser = await this.userRepository.findOne({
                                where: {
                                    id: loginUser.sub
                                }
                            });

                            if (type == 1) {
                                message = `${fromUser.name} want to add you as his follower`;
                                title = `Follow Request`;
                            } else {
                                message = `${fromUser.name} want to follow you`;
                                title = `Follow Request`;
                            }

                            let toUserObj = await this.userRepository.findOne({
                                where: {
                                    id: saveUser.id
                                }
                            })

                            const notifObj = {
                                fromUserId: fromUser.id,
                                toUserId: toUserObj.id,
                                message: message,
                                type: 'request_received',
                                title: title,
                                moduleName: type
                            }
                            console.log("notifObj", notifObj)
                            this.notificationService.normalNotification(notifObj);

                            const from = process.env.VONAGE_FROM_NUMBER
                            const to = `${saveUser.dialCode.replace("+", "") + saveUser.contactNumber}`
                            const text = `Hi, someone has sent you a friend request on I'm Just Fine. Please log in to accept the request.

Install the app:

Android - https://play.google.com/store/apps/details?id=com.imjustfine

iOS - https://apps.apple.com/in/app/im-just-fine/id6462395199
                            
Thank you!`

                            await vonage.sms.send({ to, from, text })
                                .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                                .catch(err => {
                                    console.log('There was an error sending the messages.', err["response"]);
                                });

                            // let UserData = {
                            //     isUserExist: false,
                            //     isSubscriptionPurchased: false
                            // }

                            // Assuming result is declared somewhere above
                            (result as any).isUserExist = false;
                            (result as any).isSubscriptionPurchased = false;
                            
                            resolve({
                                status: true,
                                message: `Invitation sent successfully!!`,
                                result: result,
                            })

                        } else {
                            resolve({
                                status: false,
                                message: "Something went wrong.",
                                result: {}
                            })
                        }
                    }
                }
            } catch (e) {
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
                })
            } else {
                const data = new Invitation();
                data.userId = loginUser.sub;
                data.invitedTo = invitedTo;
                data.type = type;

                if (isAlreadyInvited == null || [isAlreadyInvited].length < 1) {
                    result = await this.invitationRepository.save(data);
                } else {
                    result = isAlreadyInvited;
                }

                //Send Notification
                // {
                let message, title;

                let fromUser = await this.userRepository.findOne({
                    where: {
                        id: loginUser.sub
                    }
                });

                if (type == 1) {
                    message = `${fromUser.name} want to add you as his follower`;
                    title = `Follow Request`;
                } else {
                    message = `${fromUser.name} want to follow you`;
                    title = `Follow Request`;
                }

                let toUserObj = await this.userRepository.findOne({
                    where: {
                        id: invitedTo
                    }
                })

                const notifObj = {
                    fromUserId: fromUser.id,
                    toUserId: invitedTo,
                    message: message,
                    type: 'request_received',
                    title: title,
                    moduleName: (type == "1") ? "2" : "1"
                }

                console.log("typeeeee", (type == "1") ? "2" : "1")

                const pushNotificationObj = {
                    fromUserObj: fromUser,
                    toUserObj: toUserObj,
                    notificationTitle: title,
                    message: message,
                    completeObject: fromUser,
                    notificationType: "request_received",
                    moduleName: (type == "1") ? "2" : "1"
                }

                this.notificationService.normalNotification(notifObj);
                this.notificationService.sendPushNotifications(pushNotificationObj, toUserObj.deviceType)

                let UserData = {
                    isUserExist: true,
                    isSubscriptionPurchased: toUserObj.isSubscriptionPurchased
                }

                result.isUserExist = true;
                result.isSubscriptionPurchased = toUserObj.isSubscriptionPurchased

                return ({
                    status: true,
                    message: `Invitation sent successfully to ${isUserExist.name}`,
                    result: result
                })
            }
        }
    }

    async getRequestList(invitationListDto, req, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let { type } = invitationListDto;
                let otherInvited;

                /*let myInviatedUser = await this.invitationRepository.find({
                    where: {
                        userId: loginUser.sub,
                        type,
                        //status: Not("accepted")
                    },
                    select: {
                        "id": true, "status": true
                    },
                    relations: { invitedUser: true }
                })*/

                let myInviatedUser = await this.invitationRepository.createQueryBuilder("invites")
                    .leftJoinAndSelect("invites.invitedUser", "invitedUser")
                    .andWhere('invites.type = :type', {
                        type: type,
                    })
                    .andWhere('invites.userId = :id', {
                        id: loginUser.sub,
                    })
                    .andWhere('invitedUser.id is not null')
                    // .distinct(["invitedTo"])
                    .getMany()

                if (type == 1) {
                    otherInvited = 2;
                } else {
                    otherInvited = 1
                }

                let OtherinvitedMeUser = await this.invitationRepository.find({
                    where: {
                        invitedTo: loginUser.sub,
                        type: otherInvited,
                        user: {
                            id: Not('null')
                        }
                        //status: Not("accepted")
                    },
                    select: {
                        "id": true, "status": true
                    },
                    relations: { user: true }
                })

                await Array.prototype.push.apply(myInviatedUser, OtherinvitedMeUser);

                resolve({
                    status: true,
                    message: `Request list fetched successfully !!`,
                    result: myInviatedUser
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

    async updateStatus(req, res, loginUser) {
        return new Promise(async (resolve, reject) => {
            try {
                let { invitationId, status } = req;

                let invitationExist = await this.invitationRepository.findOne({
                    where: {
                        id: invitationId
                    }
                })

                if (status == "removed" && invitationExist) {
                    invitationExist.status = status;
                    await this.invitationRepository.save(invitationExist)

                    let data = this.invitationRepository.softRemove({
                        id: invitationId
                    })

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
                        })

                        let message = `${fromUser.name} cancel your follow request`;
                        let title = `Follow Request`;

                        const notifObj = {
                            fromUserId: fromUser.id,
                            toUserId: toUser.id,
                            message: message,
                            type: 'request_accepted',
                            title: title,
                            moduleName: invitationExist.type
                        }

                        let pushNotificationPayload = {
                            fromUserObj: fromUser,
                            toUserObj: toUser,
                            notificationTitle: "Follow Request Cancel",
                            message: message,
                            completeObject: fromUser,
                            isMultiNotifications: false,
                            notificationType: "request_accepted",
                            moduleName: invitationExist.type
                        }
                        this.notificationService.normalNotification(notifObj);
                        console.log("notifObj", notifObj)
                        this.notificationService.sendPushNotifications(pushNotificationPayload, toUser.deviceType)

                    } catch (err) {
                        console.log("revoked notification err", err)
                    }

                    resolve({
                        status: true,
                        message: `Invitation revoked successfully !!`,
                        result: data
                    })
                } else if (invitationExist && status != "removed") {
                    invitationExist.status = status;

                    let result = await this.invitationRepository.save(invitationExist);

                    //Send Notification
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
                            })

                        } else {
                            fromUser = await this.userRepository.findOne({
                                where: {
                                    id: invitationExist.invitedTo
                                }
                            })

                            toUser = await this.userRepository.findOne({
                                where: {
                                    id: invitationExist.userId
                                }
                            })
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
                        }

                        let pushNotificationPayload = {
                            fromUserObj: fromUser,
                            toUserObj: toUser,
                            notificationTitle: "Follow Request Accepted",
                            message: message,
                            completeObject: fromUser,
                            isMultiNotifications: false,
                            notificationType: "request_accepted",
                            moduleName: invitationExist.type
                        }

                        this.notificationService.normalNotification(notifObj);
                        console.log("notifObj", notifObj)
                        this.notificationService.sendPushNotifications(pushNotificationPayload, toUser.deviceType)
                    }

                    resolve({
                        status: true,
                        message: `Invitation accepted successfully !!`,
                        result: result
                    })
                } else {
                    resolve({
                        status: false,
                        message: `Inviation does not exist`,
                        result: invitationExist
                    })
                }

            } catch (e) {
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
            try {

                let userIds, existingUser;
                let { type } = req;

                let pendingRequest;

                if (type == 1) {
                    //get my care givers (My Followers)
                    let myAddedCareGivers = await this.invitationRepository.query(`select GROUP_CONCAT(DISTINCT(i.invitedTo)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.userId = "${loginUser.sub}" and i.deletedAt IS NULL`);

                    let otherAddedMeAsCareGiver = await this.invitationRepository.query(`select GROUP_CONCAT(DISTINCT(i.userid)) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.invitedTo = "${loginUser.sub}" and i.deletedAt IS NULL`);


                    if (myAddedCareGivers[0]?.["ids"]) {
                        userIds = myAddedCareGivers[0]?.["ids"].concat(',', otherAddedMeAsCareGiver[0]?.["ids"]);
                    } else {
                        userIds = otherAddedMeAsCareGiver[0]?.["ids"];
                    }

                    if (userIds == null) {
                        userIds = ''
                    }

                    //Get 
                    pendingRequest = await this.getPendingRequest(type, loginUser);

                    existingUser = await this.userRepository.createQueryBuilder("users")
                        .leftJoinAndSelect("users.helpers", "user_monitors", "user_monitors.userId = :userId", {
                            userId: loginUser.sub
                        })
                        .where('users.id IN (:...userIds)', {
                            userIds: userIds.split(','),
                        })
                        .getMany()

                } else {
                    //get my care receivers (My Following)
                    let myAddedMeAsCareReceiver = await this.invitationRepository.query(`select GROUP_CONCAT(i.invitedTo) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 2 and i.userId = "${loginUser.sub}" and i.deletedAt IS NULL`);

                    let otherAddedMeAsCareReceiver = await this.invitationRepository.query(`select GROUP_CONCAT(i.userId) as ids from invitations as i 
                    where i.status = "accepted" and i.type = 1 and i.invitedTo = "${loginUser.sub}" and i.deletedAt IS NULL`);

                    if (myAddedMeAsCareReceiver[0]?.["ids"]) {
                        userIds = myAddedMeAsCareReceiver[0]?.["ids"].concat(',', otherAddedMeAsCareReceiver[0]?.["ids"]);
                    } else {
                        userIds = otherAddedMeAsCareReceiver[0]?.["ids"];
                    }

                    if (userIds == null) {
                        userIds = ''
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
                        .getMany()
                }

                if (existingUser.length > 0 || pendingRequest.length > 0) {
                    resolve({
                        status: true,
                        message: `Record fetched successfully !!`,
                        result: {
                            "acceptedRequest": existingUser,
                            "pendingRequest": pendingRequest
                        }


                    })
                } else {
                    resolve({
                        status: false,
                        message: `No Record Found`,
                        result: {
                            "acceptedRequest": existingUser,
                            "pendingRequest": pendingRequest
                        }
                    })
                }

            } catch (e) {
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
            .getMany()

        if (type == 1) {
            otherInvited = 2;
        } else {
            otherInvited = 1
        }

        let OtherinvitedMeUser = await this.invitationRepository.find({
            where: {
                invitedTo: loginUser.sub,
                type: otherInvited,
                user: {
                    id: Not('null')
                },
                status: "pending"
            },
            select: {
                "id": true, "status": true
            },
            relations: { user: true }
        })

        await Array.prototype.push.apply(myInviatedUser, OtherinvitedMeUser);

        return (myInviatedUser)
    }

}
