import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
export declare class Setting extends SharedEntity {
    userId: string;
    type: string;
    sleepStartTime: string;
    sleepEndTime: string;
    checkinTime: string;
    checkinTimeInMinutes: string;
    sleepStartTimeIn24Format: string;
    sleepEndTimeIn24Format: string;
    detail: string;
    user: Users;
}
