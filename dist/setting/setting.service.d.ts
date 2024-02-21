import { Setting } from 'src/entity/setting.entity';
import { Repository } from 'typeorm';
import 'moment-timezone';
import { Users } from 'src/entity/user.entity';
export declare class SettingService {
    private settingRespository;
    private userRepository;
    constructor(settingRespository: Repository<Setting>, userRepository: Repository<Users>);
    createSettingRecord(req: any, res: any, loginUser: any): Promise<unknown>;
    getCheckinLIst(req: any, res: any): Promise<unknown>;
}
