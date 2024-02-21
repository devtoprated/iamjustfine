import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
export declare class Notification extends SharedEntity {
    toUserId: string;
    fromUserId: string;
    title: string;
    type: string;
    message: string;
    invitationId: string;
    isRead: boolean;
    moduleName: string;
    user: Users;
}
