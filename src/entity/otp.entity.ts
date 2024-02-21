import { Entity, Column, ManyToOne } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Boolean } from '../enums/enum';
import { Users } from './user.entity';

@Entity('otps')

export class Otp extends SharedEntity {

    @Column({ default: null })
    otp: number;

    @Column({ default: null })
    userId: string;

    @Column({ type: "tinyint", default: Boolean.False })
    isVerified: Boolean;

    @ManyToOne(() => Users, (users) => users.otp)
    user: Users

}