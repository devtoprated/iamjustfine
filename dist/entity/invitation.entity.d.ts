import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
export declare class Invitation extends SharedEntity {
    type: number;
    userId: string;
    status: string;
    invitedTo: string;
    user: Users;
    invitedUser: Users;
}
