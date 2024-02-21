import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppConfiguration } from 'src/entity/configuration.entity'

@Injectable()
export class AppConfigurationService {
    constructor(
        @InjectRepository(AppConfiguration)
        private appConfigurationRepository: Repository<AppConfiguration>

    ) { }

    async findConfigurations() {
        try {
            return await this.appConfigurationRepository.find();

        } catch (err) {
            console.log("error in configuration listing", err)
        }
    }

    async getConfigById(id) {
        try {
            return await this.appConfigurationRepository.findOne({
                where: {
                    id: id
                }
            })
        } catch (err) {
            console.log("error while finding config record", err)
        }
    }

    async updateRecord(record, requestedData) {
        try {
            record.latestAppVersion = requestedData.latestAppVersion;
            record.isForcefullyUpdateNeeded = requestedData.forceUpdate == "1" ? true : false;
            console.log({ record }, { requestedData })
            return await this.appConfigurationRepository.save(record);
        } catch (err) {
            console.log("error while updating config", err)
            throw new NotFoundException('Configuration updation Error');
        }
    }
}
