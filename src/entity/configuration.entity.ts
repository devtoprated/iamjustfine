import { Entity, Column, AfterUpdate, AfterInsert, AfterLoad, ManyToOne } from 'typeorm';
import { SharedEntity } from './shared.entity';
import { Boolean } from '../enums/enum';

@Entity('app_configurations')

export class AppConfiguration extends SharedEntity {

    @Column({ default: null })
    configurationFor: string;

    @Column({ default: null })
    latestAppVersion: string;

    @Column({ default: Boolean.False })
    isForcefullyUpdateNeeded: boolean;
}

