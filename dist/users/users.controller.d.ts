import { RegisterDto } from '.././dto/users/resgiter.dto';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';
import { checkInDto } from '.././dto/checkin/checkin.dto';
import { EditProfileDto } from '.././dto/users/edit-profile.dto';
import { checkinStatusInDto } from 'src/dto/checkin/checkinStatus.dto';
import { PushNotificationDto } from 'src/dto/notification/push-notification.dto';
export declare class UsersController {
    private authService;
    private userService;
    constructor(authService: AuthService, userService: UsersService);
    register(registerDto: RegisterDto, res: any): Promise<void>;
    getProfile(req: any, res: any): Promise<void>;
    uploadeImage(picture: Express.Multer.File, editProfileDto: EditProfileDto, req: any, res: any): Promise<void>;
    checkin(healthstatus: checkInDto, req: any, res: any): Promise<void>;
    changeCheckInStatus(checkinStatus: checkinStatusInDto, req: any, res: any): Promise<void>;
    logoutUser(req: any, res: any): Promise<void>;
    runCron(): Promise<void>;
    deleteAccount(req: any, res: any): Promise<void>;
    sendPushNotification(pushNotificationdto: PushNotificationDto, req: any, res: any): Promise<void>;
    deleteUserAccount(contactNumber: string, dialCode: string, req: any, res: any): Promise<void>;
}
