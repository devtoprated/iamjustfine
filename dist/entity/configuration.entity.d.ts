import { SharedEntity } from './shared.entity';
export declare class AppConfiguration extends SharedEntity {
    configurationFor: string;
    latestAppVersion: string;
    isForcefullyUpdateNeeded: boolean;
}
