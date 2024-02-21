import { UserMonitor } from 'src/entity/user-monitor.entity';
import { Repository } from 'typeorm';
import { Users } from 'src/entity/user.entity';
import { NotificationService } from 'src/notification/notification.service';
import { Invitation } from 'src/entity/invitation.entity';
import { NotificationLog } from 'src/entity/notification-log.entity';
export declare class UserMonitorService {
    private monitorRespository;
    private userRespository;
    private notificationService;
    private invitationRespository;
    private notificationLogRepository;
    constructor(monitorRespository: Repository<UserMonitor>, userRespository: Repository<Users>, notificationService: NotificationService, invitationRespository: Repository<Invitation>, notificationLogRepository: Repository<NotificationLog>);
    addAsHelper(req: any, res: any, loginUser: any): Promise<unknown>;
    stopHelping(req: any, res: any, loginUser: any): Promise<unknown>;
    neededPersonFollowerTokens(careReceiverObj: any, removeUserFromId: any): Promise<{
        followersTokens: any[];
        followingIds: any[];
        androidTokens: any[];
        iosTokens: any[];
    }>;
}
