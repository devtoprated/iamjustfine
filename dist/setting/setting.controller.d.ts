import { SettingService } from './setting.service';
import { SettingDto } from 'src/dto/setting/setting.dto';
export declare class SettingController {
    private readonly settingService;
    constructor(settingService: SettingService);
    create(settingDto: SettingDto, res: any, req: any): Promise<void>;
    getCheckInList(res: any, req: any): Promise<void>;
}
