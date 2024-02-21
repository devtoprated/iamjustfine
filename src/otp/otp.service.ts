require('dotenv').config();
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from '../entity/otp.entity';
import { In, Repository } from 'typeorm';
import { Users } from '../entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { Boolean, Role } from '../enums/enum';
import { AuthService } from 'src/auth/auth.service';
import { UserToken } from 'src/entity/user-token.entity';
import { EmailService } from 'src/email/email.service';
import { AppConfiguration } from 'src/entity/configuration.entity';
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);

@Injectable()
export class OtpService {
    constructor(
        private jwtService: JwtService,
        private authService: AuthService,
        // private emailService: EmailService,
        @InjectRepository(Users)
        private userRepository: Repository<Users>,
        @InjectRepository(Otp)
        private otpRepository: Repository<Otp>,
        @InjectRepository(UserToken)
        private userTokenRepository: Repository<UserToken>,
        @InjectRepository(AppConfiguration)
        private appConfiguration: Repository<AppConfiguration>,

    ) { }

    async verifyOtp(req, res) {

        return new Promise(async (resolve, reject) => {
            try {

                let contactList;

                let { dialCode, contactNumber, otp, deviceToken, deviceType } = req;
                let isExits = await this.authService.existsBycontactNumber(contactNumber, dialCode);

                //Send Email to admin
                {
                    /*if (!isExits.isEmailSent) {
                        try {
                            let emailStatus = await this.emailService.sendUserWelcome(isExits);

                            if (emailStatus) {
                                isExits.isEmailSent = true
                            }
                        } catch (err) {
                            console.log("mail err", err)
                        }
                    }*/
                }

                if (isExits) {
                    if (otp == isExits.otp.otp && isExits.otp.isVerified == 0) {
                        var add15Minutes = new Date(isExits.otp.createdAt.getTime() + 15 * 60000);
                        if (add15Minutes >= new Date()) {
                            isExits.otp.isVerified = Boolean.True;
                            await this.otpRepository.save(isExits.otp);
                            let payload = { sub: isExits.id, name: isExits.name, dialCode: isExits.dialCode, contactNumber: isExits.contactNumber }
                            let token = this.jwtService.sign(payload);

                            isExits.isVerified = true;
                            isExits.deviceType = deviceType;
                            isExits.deviceToken = deviceToken;

                            var result = {
                                id: isExits.id,
                                name: isExits.name,
                                contactNumber: isExits.contactNumber,
                                isVerified: +isExits.isVerified,
                                dialCode: isExits.dialCode,
                                deviceType: isExits.deviceType,
                                deviceToken: isExits.deviceToken,
                                picture: isExits.picture,
                                token: token,
                                contacts: contactList
                            }
                            this.userRepository.save(isExits);

                            let obj = {
                                "userId": isExits.id,
                                "token": token
                            }

                            await this.storeUserToken(obj)

                            resolve({
                                status: true,
                                message: "Confirmation code verified successfully.",
                                result: result
                            });
                        } else {
                            resolve({
                                status: false,
                                message: "Confirmation code expired.",
                            });
                        }
                    } else {
                        resolve({
                            status: false,
                            message: "Invalid Confirmation code please try again.",
                        });
                    }
                } else {
                    resolve({
                        status: false,
                        message: "Invalid contact number please try again...",
                    });
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

    async updateProfileOtp(req, res, loginUserId) {
        return new Promise(async (resolve, reject) => {
            try {
                let { dialCode, contactNumber } = req;
                let isExits = await this.authService.existsBycontactNumber(contactNumber, dialCode);

                if (isExits) {
                    if (isExits.id == loginUserId) {
                        resolve({
                            status: false,
                            message: "This number is already verified by you.",
                        });
                    } else {
                        resolve({
                            status: false,
                            message: "Account already exists",
                        });
                    }
                } else {

                    let otpRecord = await this.authService.sendOtpUsingContactNumber(loginUserId, dialCode, contactNumber)

                    if (otpRecord.status) {
                        resolve({
                            status: true,
                            message: "Confirmation code sent successfully...",
                        });
                    } else {
                        resolve({
                            status: false,
                            message: otpRecord.message,
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
        })
    }

    async deletePreviousOtp(loginUserId) {
        return await this.otpRepository.delete(
            { userId: loginUserId }
        );
    }

    async updateOtpVerification(req, res, loginUserId) {
        return new Promise(async (resolve, reject) => {
            try {
                let { otp } = req;
                let otpRecord = await this.otpExistWithUserId(loginUserId);
                if (otpRecord) {
                    if (otp == otpRecord.otp && otpRecord.isVerified == 0) {
                        var add15Minutes = new Date(otpRecord.createdAt.getTime() + 15 * 60000);
                        if (add15Minutes >= new Date()) {
                            otpRecord.isVerified = Boolean.True;
                            await this.otpRepository.save(otpRecord);

                            resolve({
                                status: true,
                                message: "Confirmation code verified successfully.",
                                result: { "success": true }
                            });
                        } else {
                            resolve({
                                status: false,
                                message: "Confirmation code expired.",
                            });
                        }
                    } else {
                        resolve({
                            status: false,
                            message: "Invalid confirmation code.",
                        });
                    }
                } else {
                    resolve({
                        status: false,
                        message: "Invalid confirmation code.",
                    });
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

    async otpExistWithUserId(userId) {
        try {
            console.log({ userId })
            return await this.otpRepository.findOne({ where: { userId: userId } })
        } catch (err) {
            console.log("error", err);
        }
    }

    async resentOtp(req, res) {
        return new Promise(async (resolve, reject) => {
            try {
                let { dialCode, contactNumber } = req;
                let isExits = await this.authService.existsBycontactNumber(contactNumber, dialCode);

                if (!isExits) {
                    resolve({
                        status: false,
                        message: "Account doesn't exist...",
                        result: {}
                    });
                }

                let otp = await this.authService.generateOtp(isExits.id);

                resolve({
                    status: true,
                    message: "Confirmation code sent successfully.",
                    //result: otp
                });

            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }

    async storeUserToken(obj) {
        try {
            await this.userTokenRepository.delete(
                { userId: obj.userId }
            );

            let userToken = new UserToken();
            userToken.token = obj.token;
            userToken.userId = obj.userId;
            return await this.userTokenRepository.save(userToken);

        } catch (err) {
            console.log("store token err", err)
        }
    }

    async configurationDetail(req, res) {
        try {
            let { dialCode, contactNumber } = req;

            var isUserExists = await this.userRepository.findOne({
                where: [
                    {
                        contactNumber: contactNumber,
                        dialCode: dialCode,
                    },
                ],
            });


            var configurations = await this.appConfiguration.find();
            let iosConfig = configurations.find((item) => (item.configurationFor).toLowerCase() === "ios")
            let androidConfig = configurations.find((item) => (item.configurationFor).toLowerCase() === "andoid")

            return ({
                status: true,
                message: "Configuration Detail fetched Successfully",
                result: {
                    "isApprovedByAdmin": isUserExists.isApprovedByAdmin,
                    "LaterAppVersionForIOS": iosConfig?.latestAppVersion,
                    "LaterAppVersionForAndroid": androidConfig?.latestAppVersion,
                    "isUpdateForcefullyForiOS": iosConfig?.isForcefullyUpdateNeeded,
                    "isUpdateForcefully": androidConfig?.isForcefullyUpdateNeeded
                }
            })

        } catch (err) {
            console.log("config  err", err)
        }
    }

    async approveUser(req, res) {
        try {
            let { dialCode, contactNumber } = req;

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

            isUserExists.isApprovedByAdmin = true;
            this.userRepository.save(isUserExists);

            return ({
                status: true,
                message: "User Approved SuccessFully.",
                result: isUserExists
            });

        } catch (err) {
            console.log("config  err", err)
        }
    }

    async demoEmailSend() {

        var isUserExists = await this.userRepository.findOne({
            where: {
                dialCode: "+91",
            }
        });
        // return this.emailService.sendUserWelcome(isUserExists);
    }
}
