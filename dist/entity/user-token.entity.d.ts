import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
export declare class UserToken extends SharedEntity {
    userId: string;
    token: string;
    user: Users;
}
