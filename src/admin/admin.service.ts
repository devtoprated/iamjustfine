import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { adminpanel, } from 'src/entity/adminpanel.entity';
import { adminpanelDto } from 'src/dto/adminpanel/adminpanel.dto';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { Users } from 'src/entity/user.entity';
import { EditProfileDto } from 'src/dto/users/edit-profile.dto';
import { use } from 'passport';
import { addUserDto } from 'src/dto/users/add-user.dto';
// import csvParser = require('csv-parser');
import { createReadStream } from 'fs';
import csvParser from 'csv-parser';
import { Invitation } from 'src/entity/invitation.entity';
import { Plans } from 'src/entity/plans.entity';
import { Subscription } from 'src/entity/subscription.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';

import { StripeService } from '../utilities/stripe.service';


// interface invitation {
//     type: string;
//     userId: string;
//     // Define the appropriate type for Users if it's different from any
//     invitedto: string;
// }

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(adminpanel)
        private adminpanelRepository: Repository<adminpanel>,

        @InjectRepository(Users)
        private userRespository: Repository<Users>,

        @InjectRepository(Plans)
        private plansRespository: Repository<Plans>,

        @InjectRepository(Invitation)
        private invitationRespository: Repository<Invitation>,

        @InjectRepository(Subscription)
        private SubscriptionRespository: Repository<Subscription>,

        @InjectRepository(MultipleUserSubscription)
        private MultipleUserSubscriptionRespository: Repository<MultipleUserSubscription>,

        private readonly stripeService: StripeService, // Use a different name for the private property
    ) { }


    async validateadmin(username: string, password: string) {
        const user = await this.adminpanelRepository.findOne({ where: { username } });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);
            if (passwordMatch) {
                return user;
            }
            else {
                // return 
            }
        }

        return null;
    }

    async adminpanel(adminpanelDto: adminpanelDto, res) {
        return new Promise(async (resolve, reject) => {
            try {
                const { username, password } = adminpanelDto;
                const saltRounds = 10;
                const salt = await bcrypt.genSalt(saltRounds);
                const hashedPassword = await bcrypt.hash(password, salt);

                const adminpanel1 = new adminpanel();
                adminpanel1.username = username;
                adminpanel1.password = password;
                adminpanel1.password = hashedPassword
                const set = await this.adminpanelRepository.save(adminpanel1);

                resolve({
                    status: true,
                    message: " admins create successfully...",
                    result: set
                })
            }


            catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });

            }
        })

    }

    async getAllUsers(): Promise<Users[]> {
        return this.userRespository.find({
            order: {
                createdAt: 'DESC',
            }
        });
    }

    async getAllUsers1(): Promise<Users[]> {
        return await this.userRespository.find(); // Fetch all users
    }
    async userData(userId: string): Promise<Users> {
        return this.userRespository.findOne({ where: { id: userId } });
    }

    async viewsuser(userId: string): Promise<Users> {
        return await this.userRespository.findOne({ where: { id: userId } });
    }

    async followinglist(userId: string): Promise<Users> {
        return await this.userRespository.findOne({ where: { id: userId } });
    }

    async getUserById(userId: string): Promise<Users> {
        return this.userRespository.findOne({ where: { id: userId } });
    }

    async deleteuser(userid: string) {
        return new Promise(async (resolve, reject) => {
            try {
                // await this.userRespository.softDelete({ id: userid })
                const findUser = await this.userRespository.findOne({ where: { id: userid } })

                if (findUser) {

                    const findSingleSubscribedUsers = await this.MultipleUserSubscriptionRespository.findOne({
                        where: {
                            contactNumber: findUser.contactNumber,
                            dialCode: findUser.dialCode
                        }
                    })

                    if (findSingleSubscribedUsers) {
                        await this.MultipleUserSubscriptionRespository.delete({
                            id: findSingleSubscribedUsers.id
                        })
                    }
                }

                const findSubscription = await this.SubscriptionRespository.findOne(
                    { where: { userId: userid } }
                )

                if (findSubscription) {

                    const findSubscribedUsers = await this.MultipleUserSubscriptionRespository.find({
                        where: { subscriptionId: findSubscription.id }
                    })

                    findSubscribedUsers.forEach(async (value) => {

                        const UsersData = await this.userRespository.findOne({
                            where: {
                                contactNumber: value.contactNumber,
                                dialCode: value.dialCode,
                            },
                        });

                        if (UsersData && UsersData.isSubscriptionPurchased == true) {
                            UsersData.isSubscriptionPurchased = false
                            await this.userRespository.save(UsersData);
                        }
                    })

                    await this.MultipleUserSubscriptionRespository.delete({
                        subscriptionId: findSubscription.id
                    })

                    await this.SubscriptionRespository.delete(
                        { userId: userid }
                    )
                }

                await this.userRespository.softDelete({ id: userid })


                resolve({
                    status: true,
                    message: "user deleted successfully...",
                })
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }

    async isPhoneNumberUnique(phoneNumber: string): Promise<boolean> {
        // Query the database to check if the phone number exists in the User collection/table
        const userWithPhoneNumber = await this.userRespository.findOne({ where: { contactNumber: phoneNumber } });
        return !userWithPhoneNumber;
    }

    async updateUser(userId: string, EditProfileDto: EditProfileDto) {

        const user = await this.userRespository.findOne({ where: { id: userId } })

        console.log(EditProfileDto.isApprovedByAdmin + " " + user.isApprovedByAdmin);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update the user's properties with the provided data
        user.name = (EditProfileDto.name).replace(/[`"]/g, '');
        user.contactNumber = EditProfileDto.contactNumber;
        user.dialCode = EditProfileDto.dialCode;

        if (EditProfileDto.isApprovedByAdmin == true) {
            user.isApprovedByAdmin = true;
        } else {
            user.isApprovedByAdmin = false;
        }

        return this.userRespository.save(user);
    }

    async saveFollowersList(data: any): Promise<any> {
        try {
            const newUser = new Invitation();
            newUser.type = data.type;

            // Check if "fromUsers" array is defined and contains elements
            if (Array.isArray(data["fromUsers"]) && data["fromUsers"].length > 0) {
                newUser.userId = data["fromUsers"].join(','); // Save multiple user IDs as a comma-separated string
            }

            // Check if "toUsers" array is defined and contains elements
            if (Array.isArray(data["toUsers"]) && data["toUsers"].length > 0) {
                newUser.invitedTo = data["toUsers"].join(','); // Save multiple user IDs as a comma-separated string
            }

            const saveFollowers = await this.invitationRespository.save(newUser);
            return {
                status: true,
                message: 'followers created successfully...',
                result: saveFollowers,
            };
        } catch (e) {
            console.error(e);
            return {
                status: false,
                error: 'Error, please check server logs for more information...',
            };
        }
    }


    async addUser(addUserDto: addUserDto, res) {
        try {
            const { name, contactNumber, dialCode, isApprovedByAdmin } = addUserDto;
            const newUser = new Users();
            newUser.name = name.replace(/[`"]/g, '');
            newUser.contactNumber = contactNumber;
            newUser.dialCode = dialCode;
            newUser.isApprovedByAdmin = isApprovedByAdmin == "0" ? false : true;

            // Save the new user to the database using the repository
            const savedUser = await this.userRespository.save(newUser);
            return {
                status: true,
                message: 'Add user created successfully...',
                result: savedUser,
            };
        } catch (e) {
            console.error(e);
            return {
                status: false,
                error: 'Error, please check server logs for more information...',
            };
        }
    }


    async updateUserData(req, res) {
        try {
            let userData = await this.userRespository.findOne({ where: { id: req.body.id } });

            userData.isApprovedByAdmin = (req.body.status == '1') ? true : false;
            await this.userRespository.save(userData);

            return res.json({
                "status": true,
                "message": "Status updated successfully",
                "result": userData
            })


        } catch (err) {
            console.log("error while updating status", err)
        }
    }

    async processUserFile(file: any): Promise<string> {
        const results = [];
        const readStream = createReadStream(file.path);

        return new Promise((resolve, reject) => {
            readStream
                .pipe(csvParser())
                .on('data', (data) => {
                    const newRow = {};
                    Object.keys(data).forEach((key) => {
                        const newKey = key.toLowerCase().replace(/[^a-z0-9]+/g, '');
                        newRow[newKey] = data[key];
                    });
                    results.push(newRow);
                })
                .on('end', async () => {
                    try {
                        let uniqueDataCollection = [];

                        const usersToInsert = results.map(async (row) => {
                            let dialCode = row.dialcode.includes('+') ? row.dialcode : `+${row.dialcode}`

                            await this.userRespository.count({
                                where: [{
                                    dialCode: dialCode,
                                    contactNumber: row.contactnumber,
                                    deletedAt: null
                                }],
                            }).then((res) => {

                                console.log("RE", res)
                                if (res == 0) {
                                    return uniqueDataCollection.push({
                                        name: row.name,
                                        contactNumber: row.contactnumber,
                                        dialCode: dialCode,
                                        isApprovedByAdmin: row.status.toLowerCase().replace(/[^a-z0-9]+/g, '') == 'approved' ? true : false,
                                    })
                                }
                            })
                        });

                        return await Promise.all(usersToInsert).then((resp) => {
                            if (uniqueDataCollection.length == 0) {
                                resolve('Users already exist in the database');
                            } else {
                                this.userRespository.save(uniqueDataCollection);
                            }
                        }).then(() => {
                            resolve('Users inserted successfully');
                        })

                        // Loop through the usersToInsert array and check for duplicates
                        /* const existingUsers = [];
                         const nonExistUsers = [];
                 
                         const promises = usersToInsert.map(async (user) => {
                             const existingUser = await this.userRespository.findOne({
                                 where: [{ dialCode: user.dialCode }, { contactNumber: user.contactNumber }, { deletedAt: null }],
                             });
                 
                             if (existingUser) {
                                 // If the user already exists, add it to the existingUsers array
                                 existingUsers.push(existingUser);
                             } else {
                                 // If the user does not exist, save it to the database
                                 return this.userRespository.save(user);
                             }
                         });*/

                        // Wait for all promises to complete
                        //const savedUsers = await Promise.all(usersToInsert);

                        /*if (existingUsers.length > 0) {
                            console.log("existingUsers", existingUsers.length)
                            resolve('Users already exist in the database');
                
                        }
                        else {
                            resolve('Users inserted successfully');
                        }*/

                    } catch (error) {
                        console.error('Error inserting users:', error);
                        reject('Error while uploading csv');
                    }
                })
                .on('error', (error) => {
                    console.error('Error reading CSV file:', error);
                    reject('Error reading CSV');
                });
        });
    }


    async addSubscriptionPlan(data, res) {
        try {
            const { price, type } = data;
            const newPlan = new Plans();

            newPlan.price = price;
            newPlan.type = type;
            
            // Save the new plan to the database using the repository

            // Create the corresponding plan on Stripe
            const stripePlan = await this.stripeService.createPlan({
                amount: Math.round(price * 100), // Stripe uses the amount in cents
                interval: 'month', // Adjust as needed (e.g., 'year' for yearly plans)
                product: {
                    name: `Plan - ${type}`, // Customize the plan name as needed
                },
                currency: 'usd', // Adjust based on your currency
                nickname: type.toLowerCase(), // Customize as needed
            });

            newPlan.stripePlanId = stripePlan.id;

            const savedSubscription = await this.plansRespository.save(newPlan);

            console.log(savedSubscription);
            return {
                status: true,
                message: 'Subscription plan created successfully...',
                result: savedSubscription,
            };
        } catch (e) {
            console.error(e);
            return {
                status: false,
                error: 'Error, please check server logs for more information...',
            };
        }
    }

    async getAllSubscriptionPlans(): Promise<Plans[]> {
        return this.plansRespository.find({
            order: {
                createdAt: 'DESC',
            }
        });
    }

    async planData(planId: string): Promise<Plans> {
        return this.plansRespository.findOne({ where: { id: planId } });


    }


    async updateSubscriptionPlan(planId: string, data) {
        const plan = await this.plansRespository.findOne({ where: { id: planId } })
        plan.type = data.type
        plan.price = data.price

        return this.plansRespository.save(plan);
    }

    async viewPlan(userId: string): Promise<Plans> {
        return await this.plansRespository.findOne({ where: { id: userId } });
    }

    async deletePlan(planId: string) {
        return new Promise(async (resolve, reject) => {
            try {
                // await this.userRespository.softDelete({ id: userid })
                await this.plansRespository.softDelete({ id: planId })

                resolve({
                    status: true,
                    message: "plan deleted successfully...",
                })
            } catch (e) {
                console.log(e);
                reject({
                    status: false,
                    error: 'Error, please check server logs for more information...'
                });
            }
        })
    }

}
