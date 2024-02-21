import { Entity, Column, AfterUpdate, AfterInsert, AfterLoad, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, CreateDateColumn } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Boolean } from '../enums/enum';
import { Users } from './user.entity';
import bcrypt from 'bcrypt';

@Entity('adminpanel')

export class adminpanel {

    @PrimaryGeneratedColumn('uuid')
    id: string;
    length: 6

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ default: null })
    username: string;

    @Column({ default: null })
    password: string;

    async comparePassword(password: string) {
        return bcrypt.compare(password, this.password);
    }

}