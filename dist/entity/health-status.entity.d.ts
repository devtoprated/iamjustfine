import { SharedEntity } from './shared.entity';
import { Users } from './user.entity';
export declare class HealthStatus extends SharedEntity {
    name: string;
    detail: string;
    userId: string;
    isCurrentStatus: boolean;
    isCronGenerated: boolean;
    user: Users;
}
