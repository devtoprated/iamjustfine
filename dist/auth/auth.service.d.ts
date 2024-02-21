import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Users } from '../entity/user.entity';
import { Otp } from 'src/entity/otp.entity';
import { Setting } from 'src/entity/setting.entity';
import 'moment-timezone';
import { UserToken } from 'src/entity/user-token.entity';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationLog } from 'src/entity/notification-log.entity';
export declare class AuthService {
    private jwtService;
    private notificationService;
    private userRepository;
    private otpRepository;
    private settingRepository;
    private userTokenRepository;
    private notificationLogRepository;
    constructor(jwtService: JwtService, notificationService: NotificationService, userRepository: Repository<Users>, otpRepository: Repository<Otp>, settingRepository: Repository<Setting>, userTokenRepository: Repository<UserToken>, notificationLogRepository: Repository<NotificationLog>);
    login(req: any): Promise<unknown>;
    register(req: any, res: any): Promise<unknown>;
    existsBycontactNumber(contactNumber: string, dialCode: string, needVerified?: boolean): Promise<Users>;
    generateOtp(userId: any): Promise<{
        status: boolean;
        message?: undefined;
        result?: undefined;
    } | {
        status: boolean;
        message: any;
        result: {};
    }>;
    sendOtpUsingContactNumber(loginUserId: any, dialCode: any, contactNumber: any): Promise<{
        status: boolean;
        message?: undefined;
        result?: undefined;
    } | {
        status: boolean;
        message: any;
        result: {};
    }>;
    createDefaultSettingRecord(req: any, userObj: any): Promise<any>;
}
