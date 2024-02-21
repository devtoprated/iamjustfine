import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Boolean } from '../enums/enum';
import { Users } from './user.entity';
import { text } from 'stream/consumers';

@Entity('notification_logs')

export class NotificationLog extends SharedEntity {

    @Column({ default: null })
    type: string;

    @Column({ default: null })
    fromUserId: string;

    @Column({ default: null })
    toUserId: string;

    @Column({ default: null })
    notificationType: string;

    @Column({ default: null, type: 'text' })
    payloadDetail: string;

    @Column({ default: null })
    message: string;

    @Column({ default: false })
    isMainFunctionLog: boolean;

    @Column({ default: false })
    isSystemNotification: boolean;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "fromUserId" })
    fromUser: Users

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "toUserId" })
    toUser: Users
}