import { ResendOtp } from '../dto/otp/resend-otp.dto';
import { VerifyOtpDto } from '../dto/otp/verify-otp.dto';
import { OtpService } from './otp.service';
import { VerifyProfileOtpDto } from '../dto/otp/verify-profile-otp.dto';
import { ConfigurationDto } from '../dto/users/configuration.dto';
export declare class OtpController {
    private otpService;
    constructor(otpService: OtpService);
    verifyOtp(verifyOtpDto: VerifyOtpDto, res: any): Promise<void>;
    resentOtp(resendOtp: ResendOtp, req: any, res: any): Promise<void>;
    updateProfileOtp(resendOtp: ResendOtp, req: any, res: any): Promise<void>;
    updateOtpVerification(verifyOtpDto: VerifyProfileOtpDto, req: any, res: any): Promise<void>;
    configurationDetail(configDto: ConfigurationDto, req: any, res: any): Promise<void>;
    approveUser(configDto: ConfigurationDto, req: any, res: any): Promise<void>;
    demoEmail(req: any, res: any): Promise<void>;
}
