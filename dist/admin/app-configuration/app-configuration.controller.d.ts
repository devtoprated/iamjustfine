import { AppConfigurationService } from 'src/admin/app-configuration/app-configuration.service';
export declare class AppConfigurationController {
    private appConfigurationService;
    constructor(appConfigurationService: AppConfigurationService);
    configurationDetail(req: any, res: any): Promise<any>;
    editConfiguration(editId: string, req: any, res: any): Promise<any>;
    updateConfiguration(recordId: string, req: any, res: any): Promise<any>;
    viewsuser(recordId: string, req: any, res: any): Promise<any>;
    checkSessionHandled(req: any, res: any): any;
}
