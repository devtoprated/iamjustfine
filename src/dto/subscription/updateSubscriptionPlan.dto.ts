import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class updateSubscriptionPlanDto {

    @ApiProperty({ example: "7a94bf88-4c4a-4ac0-9df5" })
    @IsNotEmpty()
    newSubscriptionPlanId: string;

    @ApiProperty({ 
        example: [{ dialCode: "+91", contactNumber: "1234567890" }]
    })
    @IsNotEmpty()
    @IsArray()

    customerContactNo: { dialCode: string; contactNumber: string }[];
}

