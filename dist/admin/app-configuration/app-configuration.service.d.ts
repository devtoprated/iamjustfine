import { Repository } from 'typeorm';
import { AppConfiguration } from 'src/entity/configuration.entity';
export declare class AppConfigurationService {
    private appConfigurationRepository;
    constructor(appConfigurationRepository: Repository<AppConfiguration>);
    findConfigurations(): Promise<AppConfiguration[]>;
    getConfigById(id: any): Promise<AppConfiguration>;
    updateRecord(record: any, requestedData: any): Promise<any>;
}
