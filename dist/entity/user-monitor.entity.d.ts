import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
export declare class UserMonitor extends SharedEntity {
    userId: string;
    helperId: string;
    isCurrentMonitor: boolean;
    careReceivers: Users;
    helper: Users;
}
