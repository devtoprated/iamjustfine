import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';

@Entity('helpers')
export class UserMonitor extends SharedEntity {
    @Column({ default: null })
    userId: string;

    @Column({ default: null })
    helperId: string;

    @Column({ default: true })
    isCurrentMonitor: boolean;

    @ManyToOne(() => Users, (users) => users.careReceivers)
    @JoinColumn({ name: "userId" })
    careReceivers: Users

    @ManyToOne(() => Users, (users) => users.helpers)
    helper: Users
}
