import { SharedEntity } from './shared.entity';
import { Boolean } from '../enums/enum';
import { Users } from './user.entity';
export declare class Otp extends SharedEntity {
    otp: number;
    userId: string;
    isVerified: Boolean;
    user: Users;
}
