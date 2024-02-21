import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class purchasePlanDto {

    @ApiProperty({ example: "Test" })
    @IsNotEmpty()
    subscriptionPlanId: string;

    @ApiProperty({ 
        example: [{ dialCode: "+91", contactNumber: "1234567890" }]
    })
    @IsArray()

    customerContactNo: { dialCode: string; contactNumber: string }[];
}

