import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';

@Entity('notifications')

export class Notification extends SharedEntity {

    @Column({ default: null })
    toUserId: string;

    @Column({ default: null })
    fromUserId: string;

    @Column({ default: null })
    title: string;

    @Column({ default: null })
    type: string;

    @Column("longtext")
    message: string;

    @Column({ default: null })
    invitationId: string;

    @Column({ default: false })
    isRead: boolean;


    @Column({ default: null })
    moduleName: string;


    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "fromUserId" })
    user: Users

    /*@ManyToOne(() => Notification, (notification) => notification.contactId)
    @JoinColumn({ name: "contactId" })
    contacts: Notification*/
}