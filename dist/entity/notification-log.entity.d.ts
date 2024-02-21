import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
export declare class NotificationLog extends SharedEntity {
    type: string;
    fromUserId: string;
    toUserId: string;
    notificationType: string;
    payloadDetail: string;
    message: string;
    isMainFunctionLog: boolean;
    isSystemNotification: boolean;
    fromUser: Users;
    toUser: Users;
}
