import { adminpanel } from '../entity/adminpanel.entity';
import { Repository } from 'typeorm';
export declare class AdminSeederService {
    private adminRepository;
    constructor(adminRepository: Repository<adminpanel>);
    seed(): Promise<void>;
}
