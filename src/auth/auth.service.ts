import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { In, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from '../entity/user.entity'
import { Otp } from 'src/entity/otp.entity';
import { Boolean, Role } from '../enums/enum';
import { jwtConstants } from '../config/jwt-constants';
import { SettingService } from 'src/setting/setting.service';
import { Setting } from 'src/entity/setting.entity';
let env = require("dotenv").config()
// const accountSid = env.TWILIO_ACCOUNT_SID;
// const authToken = env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
import moment from "moment";
import 'moment-timezone';
import { UserToken } from 'src/entity/user-token.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationLog } from 'src/entity/notification-log.entity';
const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
    apiKey: process.env.VONAGE_API_KEY,
    apiSecret: process.env.VONAGE_API_SECRET
})

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private notificationService: NotificationService,
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        @InjectRepository(Setting)
        private settingRepository: Repository<Setting>,
        @InjectRepository(UserToken)
        private userTokenRepository: Repository<UserToken>,
        @InjectRepository(NotificationLog)
        private notificationLogRepository: Repository<NotificationLog>,
    ) { }

    async login(req: any) {
        return new Promise(async (resolve, reject) => {
            try {
                const {
                    name,
                    dialCode,
                    contactNumber,
                    deviceType,
                    deviceToken,
                    userTimezone,
                    isDuplicateLogin
                } = req;

                let oldDeviceToken;

                let exists = await this.userRepository.findOne({
                    where: {
                        name: Like(`${name.trim()}`),
                        dialCode: dialCode,
                        contactNumber: contactNumber
                    }
                })

                console.log({ exists })

                if (exists) {

                    oldDeviceToken = exists.deviceToken;
                    exists.deviceType = deviceType;
                    exists.deviceToken = deviceToken;
                    exists.userTimezone = userTimezone;
                    await this.userRepository.save(exists);

                    let otp = await this.generateOtp(exists.id);

                    /*if is duplicate login true then send user original user someone 
                     *else try to login to your phone */
                    {
                        if (isDuplicateLogin) {
                            let fromUser = {
                                "isSystemNotification": true,
                                "name": "Admin",
                                "picture": "",
                                "fullContactNumber": ""
                            }

                            let pushNotificationPayload = {
                                fromUserObj: fromUser,
                                toUserObj: [oldDeviceToken],
                                notificationTitle: "New Device Login Request",
                                message: "A new device login using your credentials.",
                                completeObject: fromUser,
                                isMultiNotifications: true,
                                notificationType: "new_device_login",
                                moduleName: '',
                            }
                            this.notificationService.sendPushNotifications(pushNotificationPayload,deviceType)

                            //create logs for follower notified
                            {
                                try {
                                    // let record = new NotificationLog();
                                    // record.isSystemNotification = true;
                                    // record.type = "new_device_login";
                                    // record.toUserId = exists.id;
                                    // record.notificationType = "pushNotification";
                                    // record.payloadDetail = JSON.stringify(pushNotificationPayload);

                                    //await this.notificationLogRepository.insert(record)

                                    const notifObj = {
                                        toUserId: exists.id,
                                        message: "A new device login using your credentials.",
                                        type: 'request_accepted',
                                        title: "New Device Login Request",
                                        moduleName: ''
                                    }
            
                                    this.notificationService.normalNotification(notifObj);

                                } catch (err) {
                                    console.log("error login logs", err)
                                }
                            }
                        }
                    }

                    resolve({
                        status: true,
                        message: "Confirmation code sent successfully.",
                        result: exists
                    });

                } else {
                    resolve({
                        status: false,
                        message: "Invalid Credentials.",
                        result: {}
                    });
                }

            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...',
                });
            }
        });
    }

    async register(req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                const { name, contactNumber, email, password, dialCode, deviceType, deviceToken, userTimezone } = req;
                let exists = await this.existsBycontactNumber(contactNumber, dialCode);
                if (!exists) {
                    let user = new Users();
                    user.contactNumber = contactNumber;
                    user.name = name.trim();
                    user.dialCode = dialCode;
                    user.deviceType = deviceType;
                    user.deviceToken = deviceToken;
                    user.isVerified = false;
                    user.userTimezone = userTimezone;
                    user.lastCheckin = new Date();
                    let saveUser = await this.userRepository.save(user);
                    if (saveUser) {
                        let twilioDetail = await this.generateOtp(saveUser.id);

                        //generate deafult setting
                        {
                            let staticObj = {
                                "type": "notificationSetting",
                                "checkinTime": "24"
                            }
                            await this.createDefaultSettingRecord(staticObj, saveUser);
                        }

                        if (twilioDetail.status == false) {
                            this.userRepository.delete({
                                id: saveUser.id
                            })
                            resolve(twilioDetail)
                        } else {
                            resolve({
                                status: true,
                                message: "Confirmation code sent successfully.",
                                result: saveUser
                            })
                        }
                    }
                } else {
                    if (exists.isVerified == false) {
                        let twilioDetail = await this.generateOtp(exists.id);

                        if (twilioDetail.status == false) {
                            resolve(twilioDetail)
                        } else {
                            resolve({
                                status: true,
                                message: "Confirmation code sent successfully.",
                                result: exists
                            })
                        }
                    } else {
                        resolve({
                            status: false,
                            message: "Account already exists.",
                            result: {}
                        });
                    }
                }
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }

        });
    }

    async existsBycontactNumber(contactNumber: string, dialCode: string, needVerified = false) {
        if (needVerified) {
            var isUserExists = await this.userRepository.findOne({
                relations: {
                    otp: true,
                },
                where: [
                    {
                        contactNumber: contactNumber,
                        dialCode: dialCode,
                        isVerified: true
                    },
                ],
            });
        } else {
            var isUserExists = await this.userRepository.findOne({
                relations: {
                    otp: true,
                },
                where: [
                    {
                        contactNumber: contactNumber,
                        dialCode: dialCode,
                    },
                ],
            });
        }

        return isUserExists;
    }

    async generateOtp(userId) {

        let saveUser = await this.userRepository.findOne({
            where: { id: userId }
        });


        try {
            //var randomOtp = 123456

            /*return await client.messages.create({
                body: `This is your One Time Otp: ${randomOtp} from I am just fine to help you to verify your phone number.`,
                from: process.env.TWILIO_FROM_NUMBER,
                to: `${saveUser.dialCode + saveUser.contactNumber}`
            }, async (err, message) => {
                if (err) {
                    console.error('Text failed because: ' + err.message, err.code);
                } else {

                    await this.otpRepository.delete(
                        { userId: userId }
                    );

                    let otp = new Otp();
                    otp.otp = randomOtp;
                    otp.userId = userId;
                    return await this.otpRepository.save(otp);
                }
            });*/


            //Generate static otp for one user
            if (saveUser.dialCode == "+1" && saveUser.contactNumber == "9874561230") {
                await this.otpRepository.delete(
                    { userId: userId }
                );

                let otp = new Otp();
                otp.otp = 123456;
                otp.userId = userId;
                await this.otpRepository.save(otp);

                return {
                    status: true
                }

            } else {
                var randomOtp = Math.floor(100000 + Math.random() * 900000);

                //Vonage otp
                const from = process.env.VONAGE_FROM_NUMBER
                const to = `${saveUser.dialCode.replace("+", "") + saveUser.contactNumber}`
                const text = `This is your One Time Otp: ${randomOtp} from I'm just fine! to help you to verify your phone number.`

                await vonage.sms.send({ to, from, text })
                    .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                    .catch(err => {
                        console.log('There was an error sending the messages.', err["response"]);
                    });

                await this.otpRepository.delete(
                    { userId: userId }
                );

                let otp = new Otp();
                otp.otp = randomOtp;
                otp.userId = userId;
                await this.otpRepository.save(otp);

                return {
                    status: true
                }
            }

        } catch (e) {
            console.log("twilio err", e.message)

            return ({
                status: false,
                message: e.message,
                result: {}
            })
        }
    }


    async sendOtpUsingContactNumber(loginUserId, dialCode, contactNumber) {

        try {
            /*return await client.messages.create({
                body: `This is your One Time Otp: ${randomOtp} from I am just fine to help you to verify your phone number.`,
                from: process.env.TWILIO_FROM_NUMBER,
                to: `${dialCode + contactNumber}`
            }, async (err, message) => {

                if (err) {
                    console.error('Text failed because: ' + err.message);
                } else {

                    await this.otpRepository.delete(
                        { userId: loginUserId }
                    );

                    let otp = new Otp();
                    otp.otp = randomOtp;
                    otp.userId = loginUserId;
                    return await this.otpRepository.save(otp);
                }
            });*/

            let saveUser = await this.userRepository.findOne({
                where: { id: loginUserId }
            });

            if (saveUser.dialCode == "+1" && saveUser.contactNumber == "9874561230") {
                await this.otpRepository.delete(
                    { userId: loginUserId }
                );

                let otp = new Otp();
                otp.otp = 123456;
                otp.userId = loginUserId;
                await this.otpRepository.save(otp);

                return {
                    status: true
                }

            } else {
                //Vonage otp
                const from = process.env.VONAGE_FROM_NUMBER
                const to = `${dialCode.replace("+", "") + contactNumber}`
                const text = `This is your One Time Otp: ${randomOtp} from I am just fine to help you to verify your phone number.`

                await vonage.sms.send({ to, from, text })
                    .then(resp => { console.log('Message sent successfully'); console.log(resp); })
                    .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });

                var randomOtp = Math.floor(100000 + Math.random() * 900000);
                //var randomOtp = 123456;
                await this.otpRepository.delete(
                    { userId: loginUserId }
                );

                let otp = new Otp();
                otp.otp = randomOtp;
                otp.userId = loginUserId;
                await this.otpRepository.save(otp);

                return {
                    status: true
                }
            }

        } catch (e) {
            console.log("twilio err", e.message)

            return ({
                status: false,
                message: e.message,
                result: {}
            })
        }
    }

    async createDefaultSettingRecord(req, userObj) {
        try {
            let settingObj, start24TimeInHrMn, end24TimeInHrMn;;

            const settingObjDetail = await this.settingRepository.findOne({
                where: {
                    userId: userObj.id
                }
            })

            if (!settingObjDetail) {
                settingObj = new Setting();
            } else {
                settingObj = settingObjDetail;
            }

            settingObj.sleepStartTime = req.sleepStartTime ?? settingObj.sleepStartTime;
            settingObj.userId = userObj.id;
            settingObj.type = "notificationSetting";
            settingObj.sleepEndTime = req.sleepEndTime ?? settingObj.sleepEndTime;
            settingObj.checkinTime = req.checkinTime ?? settingObj.checkinTime;

            if (req.checkinTime != 30) {
                settingObj.checkinTimeInMinutes = req.checkinTime * 60;
            } else {
                settingObj.checkinTimeInMinutes = 30;
            }

            let sdateTime = moment("07:00 PM", 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');
            let edateTime = moment("09:00 AM", 'hh:mm A').format('yyyy-MM-DD HH:mm:ss');

            if (userObj.userTimezone) {
                let combineTz;
                let statictime = "-04:00";

                if (userObj.userTimezone.indexOf("-") != -1) {
                    combineTz = userObj.userTimezone.split("-");
                    combineTz[1] = `-${combineTz[1]}`
                } else {
                    combineTz = userObj.userTimezone.split("+");
                    combineTz[1] = `+${combineTz[1]}`
                }

                if (combineTz[1]) {
                    start24TimeInHrMn = moment.utc(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
                    end24TimeInHrMn = moment.utc(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(combineTz[1]).format('HH:mm:ss');
                } else {
                    start24TimeInHrMn = moment.utc(sdateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime).format('HH:mm:ss');
                    end24TimeInHrMn = moment.utc(edateTime, 'YYYY-MM-DD HH:mm:ss').utcOffset(statictime).format('HH:mm:ss');
                }
            } else {
                let statictime = "-04:00";
                start24TimeInHrMn = moment.utc().utcOffset(statictime).format('HH:mm:ss');
                end24TimeInHrMn = moment.utc().utcOffset(statictime).format('HH:mm:ss');
            }

            settingObj.sleepStartTimeIn24Format = start24TimeInHrMn;
            settingObj.sleepEndTimeIn24Format = end24TimeInHrMn;

            return await this.settingRepository.save(settingObj);
        } catch (err) {
            console.log("err in default setting creation", err)
        }
    }
}