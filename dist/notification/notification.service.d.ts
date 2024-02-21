import { Repository } from 'typeorm';
import { Notification } from 'src/entity/notification.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';
export declare class NotificationService {
    private notificationRepository;
    private notificationLogRepository;
    constructor(notificationRepository: Repository<Notification>, notificationLogRepository: Repository<NotificationLog>);
    sendPushNotifications(obj: any, deviceType?: string): Promise<void>;
    normalNotification(obj: any): Promise<void>;
    getNotificationList(req: any, res: any, loginUser: any): Promise<unknown>;
    readNotification(req: any, res: any, loginUser: any): Promise<unknown>;
    deleteNotification(req: any, res: any, loginUser: any): Promise<unknown>;
}
