import { UserMonitorService } from './user-monitor.service';
import { CreateUserMonitorDto } from '.././dto/userMonitor/create-monitor.dto';
import { StopMonitorDto } from 'src/dto/userMonitor/stop-monitor.dto';
export declare class UserMonitorController {
    private readonly userMonitorService;
    constructor(userMonitorService: UserMonitorService);
    create(createUserMonitorDto: CreateUserMonitorDto, res: any, req: any): Promise<void>;
    stopMonitoring(stopMonitorDto: StopMonitorDto, res: any, req: any): Promise<void>;
}
