export declare class adminpanel {
    id: string;
    length: 6;
    createdAt: Date;
    updatedAt: Date;
    username: string;
    password: string;
    comparePassword(password: string): Promise<any>;
}
