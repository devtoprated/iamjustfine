import { Entity, Column, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
import { MultipleUserSubscription } from './multipleUserSubscription.entity';
import { Plans } from './plans.entity';

@Entity('subscription')
export class Subscription extends SharedEntity {

    @Column({ default: null })
    userId: string;

    @Column({ default: null })
    planId: string;

    @Column({ default: null })
    type: string;

    @Column({ default: 1 })
    status: string;

    @Column({ default: null })
    dateCreation: string;

    @Column({ default: null })
    stripeSubscriptionPlanId: string;               //id returned by stripe after subscription plan purchased.


    @ManyToOne(() => Users, (user) => user.subscriptions)
    @JoinColumn({ name: "userId" })
    user: Users;

    @OneToMany(() => MultipleUserSubscription, (multisubscription) => multisubscription.subscription)
    multisubscription: MultipleUserSubscription[];

    @ManyToOne(() => Plans, (plan) => plan.subscriptions, { eager: true, cascade: true })
    @JoinColumn({ name: 'planId' })
    plan: Plans;
}