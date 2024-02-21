import { Entity, Column, BeforeInsert, BeforeUpdate, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Status, InvitationType } from '../enums/enum';
import { Users } from './user.entity';

@Entity('invitations')

export class Invitation extends SharedEntity {

    @Column({ default: InvitationType.MyFollower })
    type: number;

    @Column({ default: null })
    userId: string;

    @Column({ default: Status.Pending })
    status: string;

    @Column({ default: null })
    invitedTo: string;

    @ManyToOne(() => Users, (users) => users.invitation)
    user: Users

    @ManyToOne(() => Users, (users) => users.invitedTo)
    @JoinColumn({ name: 'invitedTo' })
    invitedUser: Users
}