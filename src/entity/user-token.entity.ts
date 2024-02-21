import {
    Entity,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';

@Entity('user_tokens')

export class UserToken extends SharedEntity {
    @Column({ default: null })
    userId: string;

    @Column('text')
    token: string;

    @ManyToOne(() => Users, (users) => users.tokens)
    @JoinColumn({ name: "userId" })
    user: Users;
}
