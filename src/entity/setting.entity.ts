import {
    Entity,
    Column,
    ManyToOne,
} from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';

@Entity('settings')
export class Setting extends SharedEntity {
    @Column({ default: null })
    userId: string;

    @Column({ default: null })
    type: string;

    @Column({ default: null })
    sleepStartTime: string;

    @Column({ default: null })
    sleepEndTime: string;

    @Column({ default: null })
    checkinTime: string;

    @Column({ default: null })
    checkinTimeInMinutes: string;

    @Column({ default: null })
    sleepStartTimeIn24Format: string;

    @Column({ default: null })
    sleepEndTimeIn24Format: string;

    @Column({ default: null })
    detail: string;

    @ManyToOne(() => Users, (users) => users.setting)
    user: Users
}
