import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Subscription } from 'src/entity/subscription.entity';
import { Plans } from 'src/entity/plans.entity';
import { StripeService } from 'src/utilities/stripe.service';
import { Users } from 'src/entity/user.entity';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';
import { updateSubscriptionPlanDto } from 'src/dto/subscription/updateSubscriptionPlan.dto';


@Injectable()
export class SubscriptionService {

    constructor(
        @InjectRepository(Subscription)
        private subscriptionRepository: Repository<Subscription>,

        @InjectRepository(Plans)
        private PlansRepository: Repository<Plans>,

        @InjectRepository(Users)
        private UsersRepository: Repository<Users>,

        @InjectRepository(MultipleUserSubscription)
        private multiSubscriptionUsersRepository: Repository<MultipleUserSubscription>,
        private readonly stripeService: StripeService,
    ) { }
    async subscriptionPlanList(res, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const plans = await this.PlansRepository.find({ relations: ['subscriptions'] });
                let usersContact = [];
                let noOfContactsSubscribed = 0;
                const filteredPlans = await Promise.all(
                    plans.map(async (plan) => {
                        const subscriptions = plan.subscriptions.filter(subscription => subscription.userId === user?.sub);

                        if (subscriptions.length > 0) {
                            const subscriptionIds = subscriptions.map(subscription => subscription.id);

                            usersContact = await this.multiSubscriptionUsersRepository.find({
                                where: {
                                    userId: user?.sub,
                                    subscriptionId: In(subscriptionIds),
                                },

                                select: ['dialCode', 'contactNumber']
                            });
                            noOfContactsSubscribed = usersContact?.length
                            return { ...plan, usersContact, noOfContactsSubscribed };
                        } else {
                            return { ...plan, usersContact, noOfContactsSubscribed };
                        }
                    })
                );

                const finalOutput = await filteredPlans.map((plan) => ({
                    ...plan,
                    subscriptions: undefined,
                }));
                resolve({
                    status: true,
                    message: "Fetched subscription plan list successfully.",
                    result: finalOutput,
                });

            } catch (err) {
                console.log(err);
                reject({
                    status: false,
                    error: `${err} Error, please check server logs for more information...`,
                });
            }
        });
    };

    async purchaseSubscription(req, res, user) {
        return new Promise(async (resolve, reject) => {
            try {
                const USER = req.user
                const DATA = req.body
                let metadata = USER;
                let userData = DATA.customerContactNo;

                if (!userData || userData.length == 0) {
                    resolve({
                        status: false,
                        message: "Please provide customer contact details.",
                        result: null,
                    });
                }

                let checkDataExists = await Promise.all(
                    userData.map(async (item) => {
                        const checkifExists = await this.multiSubscriptionUsersRepository.findOne({
                            where: {
                                contactNumber: item.contactNumber,
                                dialCode: item.dialCode,
                            },
                        });
                        if (checkifExists) {
                            resolve({
                                status: false,
                                message: ` ${checkifExists?.dialCode} ${checkifExists?.contactNumber} is already subscribed to a subscription plan please update contactNumber.`,
                                result: null,
                            });
                        }
                        return checkifExists;
                    })
                );
                const customer = await this.stripeService.createCustomer(USER.contactNumber, metadata);

                const user = await this.UsersRepository.findOne({ where: { id: USER.sub } })
                user.customerId = customer.id
                this.UsersRepository.save(user);

                const plan = await this.PlansRepository.findOne({ where: { id: DATA.subscriptionPlanId } })
                const sessionData = await this.stripeService.createSession(plan.stripePlanId, user, plan, DATA);

                resolve({
                    status: true,
                    message: "Generate payment url successfully.",
                    result: sessionData.url
                })

            } catch (err) {
                console.log(err);
                reject({
                    status: false,
                    error: ` ${err}  Error, please check server logs for more information...`,
                });
            }

        })

    }


    async cancelSubscription(req, res, subscriptionId) {
        return new Promise(async (resolve, reject) => {
            try {
                const loggedInUserId = req?.user?.sub

                const findUser = await this.UsersRepository.findOne({
                    where: {
                        id: loggedInUserId
                    }
                });

                const isSubscriptionCheck = await this.subscriptionRepository.findOne({
                    where: {
                        userId: loggedInUserId
                    }
                });

                const findMultiSubscriptionUsersRepository = await this.multiSubscriptionUsersRepository.findOne({
                    where: {
                        dialCode: findUser.dialCode,
                        contactNumber: findUser.contactNumber
                    }
                });

                if (isSubscriptionCheck) {
                    const cancelSubscription = await this.stripeService.cancelUserSubscriptionPlan(isSubscriptionCheck);
                } else {
                    if (findMultiSubscriptionUsersRepository) {
                        await this.multiSubscriptionUsersRepository.delete({
                            dialCode: findUser.dialCode,
                            contactNumber: findUser.contactNumber
                        });

                        findUser.isSubscriptionPurchased = false

                        await this.UsersRepository.save(findUser)
                    }
                }

                resolve({
                    status: true,
                    message: "Cancelled subscription succesfully",
                    result: "Cancelled subscription succesfully"
                })

            }
            catch (err) {
                console.log("Error is===========", err);
                reject({
                    status: false,
                    error: `${err} Error, please check server logs for more information...`,
                });
            }
        })
    }

    updateUserSubscriptionPlan(req, res, subscriptionPlanId: string, purchasePlanDto: updateSubscriptionPlanDto) {
        return new Promise(async (resolve, reject) => {

            try {
                const loggedInUserId = req?.user?.sub;
                const isSubscriptionCheck = await this.subscriptionRepository.findOne({
                    where: {
                        userId: loggedInUserId,
                    },
                });

                const UsersData = await this.UsersRepository.findOne({
                    where: {
                        id: loggedInUserId,
                    },
                });

                if (UsersData && UsersData.isSubscriptionPurchased == true) {
                    UsersData.isSubscriptionPurchased = false
                    await this.UsersRepository.save(UsersData);
                }

                // if(req?.user.){

                // }


                if (!isSubscriptionCheck) {
                    resolve({
                        status: false,
                        message: "User is not subscribed to any subscription plan.",
                        result: null,
                    });
                } else {

                    if (isSubscriptionCheck.planId == purchasePlanDto.newSubscriptionPlanId) {
                        resolve({
                            status: false,
                            message: "You already purchase this plan please select another plan",
                            result: null
                        })
                    }

                    const findnumbers = await this.multiSubscriptionUsersRepository.find({
                        where: {
                            subscriptionId: isSubscriptionCheck.id
                        }
                    })

                    findnumbers.forEach(async (value) => {

                        const UsersData = await this.UsersRepository.findOne({
                            where: {
                                contactNumber: value.contactNumber,
                                dialCode: value.dialCode,
                            },
                        });

                        if (UsersData && UsersData.isSubscriptionPurchased == true) {
                            UsersData.isSubscriptionPurchased = false
                            await this.UsersRepository.save(UsersData);
                        }

                    })

                    await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: isSubscriptionCheck.id
                    })

                    // check if number already exists and user is subscribed already.
                    let userData = purchasePlanDto.customerContactNo;
                    let checkDataExists = await Promise.all(

                        userData.map(async (item) => {

                            const checkifExists = await this.multiSubscriptionUsersRepository.findOne({
                                where: {
                                    contactNumber: item.contactNumber,
                                    dialCode: item.dialCode,
                                },
                            });

                            if (checkifExists) {
                                resolve({
                                    status: false,
                                    message: `${checkifExists?.dialCode} ${checkifExists?.contactNumber} is already subscribed to a subscription plan please update contactNumber.`,
                                    result: null,
                                });
                            }
                            return checkifExists;
                        })
                    );

                    let hasData = checkDataExists.some((item) => item !== null);

                    if (!hasData) {
                        let alreadySubscribedStripePlanId = isSubscriptionCheck?.stripeSubscriptionPlanId;
                        let alreadySubscribedPlan = isSubscriptionCheck?.plan;
                        const updateData = await this.stripeService.updateUserPlan(alreadySubscribedStripePlanId, alreadySubscribedPlan, purchasePlanDto, loggedInUserId);
                        resolve({
                            status: true,
                            message: updateData,
                            result: "updated successfully"
                        });
                    }
                }
            } catch (err) {
                console.log("Error is", err);
                reject(err); // Make sure to reject the promise in case of an error
            }
        });
    }

    async updateUserinExistingSubscription(req, res, subscriptionId, purchasePlanDto: updateSubscriptionPlanDto) {
        return new Promise(async (resolve, reject) => {
            try {
                const loggedInUserId = req.user.sub;
                const isSubscriptionCheck = await this.subscriptionRepository.findOne({
                    where: {
                        userId: loggedInUserId,
                    },
                });
                if (!isSubscriptionCheck) {
                    resolve({
                        status: false,
                        message: "User is not subscribed to any subscription plan.",
                        result: null,
                    });
                } else {

                    let userData = purchasePlanDto.customerContactNo;

                    const findNumber = await this.multiSubscriptionUsersRepository.delete({
                        subscriptionId: isSubscriptionCheck.id
                    })

                    // Use Promise.all to wait for all async operations in the map
                    await Promise.all(userData.map(async (item) => {

                        try {
                            console.log("Before trying to update user");
                            await this.UsersRepository.update(
                                { contactNumber: item.contactNumber, dialCode: item.dialCode },
                                { isSubscriptionPurchased: true }
                            );
                            console.log("After trying to update user");
                        } catch (error) {
                            console.error("Error updating user:", error);
                            // Handle the error as needed
                            // Return or throw the error depending on your error-handling strategy
                        }

                            let saveData = {
                                userId: loggedInUserId,
                                subscriptionId: isSubscriptionCheck?.id,
                                contactNumber: item?.contactNumber,
                                dialCode: item?.dialCode,
                                planId: isSubscriptionCheck?.planId
                            }
                            await this.multiSubscriptionUsersRepository.save(saveData);
                        


                    }));
                    resolve({
                        status: true,
                        message: "Contacts inside subscription Updated Successfully.",
                        result: "updated successfully"
                    });
                }
            } catch (err) {
                console.log("error is ", err);
                reject({
                    status: false,
                    error: `${err}  Error, please check server logs for more information...`,
                });
            }
        });
    }

    async deleteSubscribedNumber(body, res) {
        try {
            const { customerContactNo } = body
            const { dialCode, contactNumber } = customerContactNo

            const findNumber = await this.multiSubscriptionUsersRepository.findOne({
                where: {
                    dialCode: dialCode,
                    contactNumber: contactNumber
                }
            })

            if (findNumber) {
                const findNumber = await this.multiSubscriptionUsersRepository.delete({
                    dialCode: dialCode,
                    contactNumber: contactNumber
                })

                const findUser = await this.UsersRepository.findOne({
                    where: {
                        dialCode: dialCode,
                        contactNumber: contactNumber
                    }
                })

                if (findUser) {
                    findUser.isSubscriptionPurchased = false
                    await this.UsersRepository.save(findUser)

                }
            }

            return ({
                status: true,
                message: "Number deleted Successfully.",
                result: "updated successfully"
            });
        } catch (error) {
            console.log(error)
        }




    }
}