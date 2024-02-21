import { NotificationService } from './notification.service';
import { GetNotificationDto } from '.././dto/notification/get-notification.dto';
import { ReadNotificationDto } from '.././dto/notification/read-notification.dto';
import { DeleteNotificationDto } from 'src/dto/notification/delete-notification.dto';
export declare class NotificationController {
    private notificationService;
    constructor(notificationService: NotificationService);
    inviteUser(getNotificationDto: GetNotificationDto, req: any, res: any): Promise<void>;
    markRead(readNotificationDto: ReadNotificationDto, req: any, res: any): Promise<void>;
    deleteNotification(deleteNotificationDto: DeleteNotificationDto, req: any, res: any): Promise<void>;
}
