import { Entity, Column, AfterUpdate, AfterInsert, AfterLoad, ManyToOne } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Boolean } from '../enums/enum';
import { Users } from './user.entity';

@Entity('health_status')

export class HealthStatus extends SharedEntity {

    @Column({ default: null })
    name: string;

    @Column({ default: null })
    detail: string;

    @Column({ default: null })
    userId: string;

    @Column({ type: "tinyint", default: Boolean.False })
    isCurrentStatus: boolean;

    @Column({ type: "tinyint", default: Boolean.False })
    isCronGenerated: boolean;

    @ManyToOne(() => Users, (users) => users.otp)
    user: Users
}