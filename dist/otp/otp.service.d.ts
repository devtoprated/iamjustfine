import { Otp } from '../entity/otp.entity';
import { Repository } from 'typeorm';
import { Users } from '../entity/user.entity';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { UserToken } from 'src/entity/user-token.entity';
import { AppConfiguration } from 'src/entity/configuration.entity';
export declare class OtpService {
    private jwtService;
    private authService;
    private userRepository;
    private otpRepository;
    private userTokenRepository;
    private appConfiguration;
    constructor(jwtService: JwtService, authService: AuthService, userRepository: Repository<Users>, otpRepository: Repository<Otp>, userTokenRepository: Repository<UserToken>, appConfiguration: Repository<AppConfiguration>);
    verifyOtp(req: any, res: any): Promise<unknown>;
    updateProfileOtp(req: any, res: any, loginUserId: any): Promise<unknown>;
    deletePreviousOtp(loginUserId: any): Promise<import("typeorm").DeleteResult>;
    updateOtpVerification(req: any, res: any, loginUserId: any): Promise<unknown>;
    otpExistWithUserId(userId: any): Promise<Otp>;
    resentOtp(req: any, res: any): Promise<unknown>;
    storeUserToken(obj: any): Promise<UserToken>;
    configurationDetail(req: any, res: any): Promise<{
        status: boolean;
        message: string;
        result: {
            isApprovedByAdmin: boolean;
            LaterAppVersionForIOS: string;
            LaterAppVersionForAndroid: string;
            isUpdateForcefullyForiOS: boolean;
            isUpdateForcefully: boolean;
        };
    }>;
    approveUser(req: any, res: any): Promise<{
        status: boolean;
        message: string;
        result: Users;
    }>;
    demoEmailSend(): Promise<void>;
}
