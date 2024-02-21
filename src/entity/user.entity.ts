import { Entity, Column, AfterUpdate, AfterInsert, AfterLoad, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Boolean, Role } from '../enums/enum';
import { IsOptional } from 'class-validator';
import { UserToken } from './user-token.entity';
import { Otp } from './otp.entity';
import { HealthStatus } from './health-status.entity';
import { Invitation } from './invitation.entity';
import { UserMonitor } from './user-monitor.entity';
import { Setting } from './setting.entity';
import { Subscription } from './subscription.entity';
import { Plans } from './plans.entity';

@Entity('users')

export class Users extends SharedEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    length: 6

    @Column({ default: null })
    name: string;

    @Column({ default: null })
    contactNumber: string;

    @Column({ default: null })
    dialCode: string;

    @Column({ default: null })
    deviceType: string;

    @Column({ default: null })
    deviceToken: string;

    @Column({ default: false })
    isVerified: boolean;

    @Column({ default: Boolean.False })
    isEmailSent: boolean;

    @Column({ default: Boolean.False })
    isSubscriptionPurchased: boolean;

    @Column({ default: Boolean.False })
    isApprovedByAdmin: boolean;

    @Column({ default: null })
    picture: string;

    @IsOptional()
    fullContactNumber: string;

    @IsOptional()
    profileImageLink: string;

    @Column({ default: null, type: 'timestamp' })
    lastCheckin: Date;

    @Column({ default: null, type: 'timestamp' })
    warningTime: Date;

    @Column({ default: null })
    userTimezone: String;

    @Column({ default: false })
    islogOut: boolean;

    @Column({ default: 0 })
    severity: number;

    @Column({ default: true })
    isNotificationAllowed: boolean

    @Column({ default: false })
    customerId: string;

    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    generateFullContactNumber(): void {
        this.fullContactNumber = `${this.dialCode != null ? this.dialCode.replace(/\+/g, '') : this.dialCode}${this.contactNumber}`;
    }


    @AfterLoad()
    @AfterInsert()
    @AfterUpdate()
    generateFullProfileImagePath(): void {
        this.profileImageLink = `${this.picture != null ? process.env.nodeSiteUrl + "/" + this.picture : this.picture}`;
    }

    @OneToOne(() => Otp, (otp) => otp.user)
    otp: Otp

    @OneToMany(() => UserToken, (userToken) => userToken.user)
    tokens: UserToken[]

    @OneToMany(() => HealthStatus, (currentStatus) => currentStatus.user)
    currentStatus: HealthStatus[]


    @OneToMany(() => UserMonitor, (userMonitor) => userMonitor.helper)
    helpers: UserMonitor[]

    @OneToMany(() => UserMonitor, (userMonitor) => userMonitor.careReceivers)
    careReceivers: UserMonitor[]

    @OneToMany(() => Invitation, (invitation) => invitation.user)
    invitation: Invitation[]

    @OneToMany(() => Invitation, (invitation) => invitation.invitedTo)
    invitedTo: Invitation[]

    @OneToMany(() => Setting, (setting) => setting.user)
    setting: Setting[];

    // @OneToMany(() => Subscription, (subscription) => subscription.userSubscriptionId)
    // subscriptions: Subscription[];
    @OneToMany(() => Subscription, subscription => subscription.user)
    subscriptions: Subscription[];
    @OneToMany(() => Plans, plans => plans.user)
    plans: Plans[];
}