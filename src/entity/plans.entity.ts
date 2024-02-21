import { Entity, Column, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
import { Subscription } from './subscription.entity';
import { MultipleUserSubscription } from './multipleUserSubscription.entity';

@Entity('plans')

export class Plans extends SharedEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    length: 6

    @Column({ default: null })
    stripePlanId: string;

    @Column({ default: null })
    type: string;

    @Column({ default: null })
    price: string;

    @Column({ default: null })
    duration: string;

    @Column({ default: 1 })
    status: string;

    @Column({ default: null })
    columnOrder: string;

    @Column({ default: null })
    dateCreation: string;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "userId" })
    user: Users;

    @OneToMany(() => Subscription, subscription => subscription.plan)
    subscriptions: Subscription[];

    // @OneToMany(() => MultipleUserSubscription, multisubscription => subscription.plan)
    @OneToMany(() => MultipleUserSubscription, MultiUserSubscription => MultiUserSubscription.planId)
    multiUserSubscription: MultipleUserSubscription[];
}