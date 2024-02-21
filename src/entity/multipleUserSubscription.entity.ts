import { Entity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
import { Subscription } from './subscription.entity';
import { Plans } from './plans.entity';

@Entity('multipleUserSubscription')
export class MultipleUserSubscription extends SharedEntity {

    @Column({ default: null })
    userId: string;

    @Column({ default: null })
    planId: string;

    @Column({ default: null })
    subscriptionId: string;

    @Column({ default: null })
    contactNumber: string;

    @Column({ default: null })
    dialCode: string;

    @ManyToOne(() => Subscription, (subscription) => subscription.id)
    @JoinColumn({ name: "subscriptionId" })
    subscription: Subscription;

    @ManyToOne(() => Users, (user) => user.id)
    @JoinColumn({ name: "userId" })
    user: Users;

    @ManyToOne(() => Plans, (plan) => plan.multiUserSubscription)
    @JoinColumn({ name: "planId" })
    plan: Plans
}

