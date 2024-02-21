import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { adminpanel } from '../entity/adminpanel.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminSeederService {
    constructor(
        @InjectRepository(adminpanel)
        private adminRepository: Repository<adminpanel>,
    ) { }

    async seed() {
        const defaultAdmins = [
            { username: 'admin39', password: 'password10' },
        ];
        for (const adminData of defaultAdmins) {
            const hashedPassword = await bcrypt.hash(adminData.password, 10); // Hash the password
            const admin = this.adminRepository.create({
                username: adminData.username,
                password: hashedPassword,
            });
            await this.adminRepository.save(admin);
        }
    }

}
