// src/stripe/stripe.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { Stripe } from 'stripe';
import { Users } from 'src/entity/user.entity';
import { Subscription } from 'src/entity/subscription.entity';

import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Brackets, Connection, In, Not, Repository } from 'typeorm';
import { MultipleUserSubscription } from 'src/entity/multipleUserSubscription.entity';
import { updateSubscriptionPlanDto } from 'src/dto/subscription/updateSubscriptionPlan.dto';
import { Plans } from 'src/entity/plans.entity';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor(@Inject('STRIPE_KEY') private readonly stripeKey: string,

        @InjectRepository(Users)
        private UsersRepository: Repository<Users>,

        @InjectRepository(MultipleUserSubscription)
        private multiUserSubscriptionRepository: Repository<MultipleUserSubscription>,

        @InjectRepository(Subscription)
        private SubscriptionRepository: Repository<Subscription>,

        @InjectRepository(Plans)
        private planRepository: Repository<Plans>,
    ) {
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2023-10-16', // Update to the latest Stripe API version
        });
    }

    async createPlan(planData: Stripe.PlanCreateParams): Promise<Stripe.Plan> {
        return this.stripe.plans.create(planData);
    }

    createCustomer(phone: string, metadata: object): Promise<Stripe.Customer> {
        return this.stripe.customers.create({
            phone,
            metadata: metadata as Stripe.Emptyable<Stripe.MetadataParam>,
        });
    }

    async createSession(planId: string, user: any, plan: any, DATA: any): Promise<Stripe.Checkout.Session> {
        try {
            let metadata = {
                sfsd: "sfsfsd"
            }

            const session = this.stripe.checkout.sessions.create({
                success_url: 'https://example.com/success',
                cancel_url: 'https://example.com/cancel',
                payment_method_types: ['card'],
                billing_address_collection: 'auto', // Collect the billing address for automatic payment
                line_items: [
                    {
                        price: planId,
                        quantity: 1,
                    },
                ],
                mode: 'subscription',
                metadata: {
                    userId: user.id,
                    planId: planId,
                    type: plan.type,
                    customerDetails: JSON.stringify(DATA.customerContactNo),
                    subscriptionPlanId: DATA.subscriptionPlanId
                }

            });

            return session;
        } catch (error) {
            // Handle the error appropriately
            console.error('Error creating checkout session:', error);
            throw new Error('Error creating checkout session');
        }
    }

    async handleSubscriptionWebhook(req: any, res: any, rawBody: any): Promise<void> {
        try {
            const sig = req.headers['stripe-signature'];
            let event;

            try {
                event = this.stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
            } catch (err) {
                console.error('Webhook Error:', err.message);
                res.status(400).send(`Webhook Error: ${err.message}`);
                return;
            }

            // Handle the event
            switch (event.type) {
                case 'invoice.payment_succeeded':
                    const invoice = event.data.object; // contains a payment_intent
                    // Handle successful payment
                    console.log('Payment succeeded:', invoice);

                    break;

                case 'invoice.payment_failed':
                    // If payment fails, you can react accordingly
                    const failedInvoice = event.data.object;
                    console.log('Payment failed:', failedInvoice);

                    const isSubscriptionCheck = await this.SubscriptionRepository.findOne({
                        where: {
                            stripeSubscriptionPlanId: failedInvoice.subscription
                        }
                    });

                    if (isSubscriptionCheck) {
                        await this.cancelUserSubscriptionPlan(isSubscriptionCheck);
                    }

                    break;

                case 'customer.subscription.created':
                    const subscriptionCreated = event.data.object;
                    console.log('Subscription created:', subscriptionCreated);

                    // Retrieve customer details from the subscription object
                    const customerId = subscriptionCreated.customer;
                    const customer = await this.stripe.customers.retrieve(customerId);
                    console.log('Customer details:', customer);
                    break;

                case 'customer.subscription.updated':
                    // Handle subscription updates (e.g., plan change)
                    const subscriptionUpdated = event.data.object;
                    console.log('Subscription updated:', subscriptionUpdated);
                    break;

                case 'customer.subscription.deleted':
                    // Handle subscription cancellation

                    const subscriptionDeleted = event.data.object;
                    console.log(subscriptionDeleted, "delete subscription event")
                    await this.removeUserSubscriptionfromDb(subscriptionDeleted)
                    break;

                case 'checkout.session.completed':
                    // Handle subscription cancellation
                    console.log("hi i am in complete session ")
                    const sessionComplete = event.data.object;
                    const data = sessionComplete.metadata
                    const contactData = JSON.parse(sessionComplete.metadata?.customerDetails)

                    const user = await this.UsersRepository.findOne({ where: { id: data.userId } })
                    // user.isSubscriptionPurchased = true
                    // const saveduser = await this.UsersRepository.save(user);

                    try {

                        let savedSubscription = await this.SubscriptionRepository.save({
                            userId: user.id,
                            planId: data.subscriptionPlanId,
                            type: data.type,
                            stripeSubscriptionPlanId: sessionComplete?.subscription
                        });

                        // here extra logics.
                        let userData = contactData;

                        let multipleUserSubscriptionArray = contactData.map((value) => {
                            value.userId = data.userId
                            value.subscriptionId = savedSubscription.id
                            value.planId = data.subscriptionPlanId
                            return value
                        });

                        await this.multiUserSubscriptionRepository.save(multipleUserSubscriptionArray);
                        // Update user subscription based on DIalCOde Number in user table.
                        await Promise.all(userData.map(async (item) => {
                            const updateUser = await this.UsersRepository.update(
                                { contactNumber: item.contactNumber, dialCode: item.dialCode },
                                { isSubscriptionPurchased: true }
                            )
                        }));
                    }

                    catch (err) {
                        console.log("Here error is", err)
                    }

                    console.log('session Complete:', sessionComplete);
                    break;

                case 'checkout.session.expired':
                    const checkoutSessionExpired = event.data.object;

                    // Then define and call a function to handle the event checkout.session.expired
                    break;

                default:
                    console.log(`Unhandled event type ${event.type}`);
            }


        } catch (error) {
            // Handle the error appropriately
            console.error('Error handling subscription webhook:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async removeUserSubscriptionfromDb(subscriptionDeleted: Stripe.Subscription): Promise<void> {
        try {
            const dataToBeRemove = await this.SubscriptionRepository.findOne({
                where: {
                    stripeSubscriptionPlanId: subscriptionDeleted.id,
                },
            });

            if (dataToBeRemove) {
                await this.SubscriptionRepository.delete(dataToBeRemove.id);
                const multipleUserSubscriptions = await this.multiUserSubscriptionRepository.find({
                    where: {
                        subscriptionId: dataToBeRemove?.id,
                    },
                    select: ["dialCode", "contactNumber"],
                });

                await multipleUserSubscriptions.map(async (data) => {
                    let userToUpdate = await this.UsersRepository.findOne({
                        where: {
                            contactNumber: data.contactNumber,
                            dialCode: data?.dialCode
                        }
                    });
                    if (userToUpdate && userToUpdate?.isSubscriptionPurchased == true) {
                        userToUpdate.isSubscriptionPurchased = false;
                        await this.UsersRepository.save(userToUpdate)
                    };
                });

                await this.multiUserSubscriptionRepository.delete({
                    subscriptionId: dataToBeRemove?.id,
                });
            };

        } catch (err) {
            console.log("Error is", err);
            throw err;
        }
    }

    async cancelUserSubscriptionPlan(isSubscriptionCheck: any): Promise<string | Stripe.Subscription> {
        try {
            // Retrieve the subscription information
            let messages = "";

            const cancelSubs = await this.stripe.subscriptions.cancel(
                isSubscriptionCheck?.stripeSubscriptionPlanId
            );

            messages = `Your subscription is cancelled successfully`
            return messages;


        } catch (err) {
            console.log("Error is", err);
            throw err;
        }
    }

    async updateUserPlan(alreadySubscribedStripePlanId, alreadySubscribedPlan, purchasePlanDto: updateSubscriptionPlanDto, loggedInUserId: string) {
        try {
            let message = ""
            const currentSubscription = await this.stripe.subscriptions.retrieve(alreadySubscribedStripePlanId);
            if (currentSubscription) {
                const subscriptionDeleted: any = {
                    id: alreadySubscribedStripePlanId
                }
                const newPlan = await this.planRepository.findOne({
                    where: {
                        id: purchasePlanDto.newSubscriptionPlanId
                    }
                });

                const currentSubscriptionItem = currentSubscription.items.data[0];

                const datas = await this.stripe.subscriptions.update(alreadySubscribedStripePlanId, {
                    items: [
                        {
                            id: currentSubscriptionItem.id,
                            price: newPlan?.stripePlanId,
                        },
                    ],
                    proration_behavior: 'none',
                    billing_cycle_anchor: 'now', // Align billing cycle to the current time
                });

                if (datas) {
                    await this.removeUserSubscriptionfromDb(subscriptionDeleted)
                    // await this.removeUserSubscriptionfromDb(subscriptionDeleted);
                    let savedSubscription = await this.SubscriptionRepository.save({
                        userId: loggedInUserId,
                        planId: newPlan.id,
                        type: newPlan.type,
                        stripeSubscriptionPlanId: datas?.id
                    });

                    let multipleUserSubscriptionArray = purchasePlanDto.customerContactNo.map((value: any) => {
                        value.userId = loggedInUserId
                        value.subscriptionId = savedSubscription.id
                        value.planId = datas.id
                        return value
                    });

                    purchasePlanDto.customerContactNo.forEach(async (value) => {
                        const UsersData = await this.UsersRepository.findOne({
                            where: {
                                contactNumber: value.contactNumber,
                                dialCode: value.dialCode,
                            },
                        });

                        if (UsersData) {
                            UsersData.isSubscriptionPurchased = true
                            await this.UsersRepository.save(UsersData);
                        }
                    })


                    await this.multiUserSubscriptionRepository.save(multipleUserSubscriptionArray);
                    message = `Subscription plan updated sucessfully from ${alreadySubscribedPlan.type} to ${newPlan.type}`
                    return message
                }
                else {
                    message = `Failed to update subscription plan`
                    return message
                }
            }
        }
        catch (err) {
            console.log("Error is", err)
            throw err;

        }
    }
}
