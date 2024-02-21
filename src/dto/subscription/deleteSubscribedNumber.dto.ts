import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty } from "class-validator";

export class deleteSubscribedNumberDto {

    @ApiProperty({ 
        example: { dialCode: "+91", contactNumber: "1234567890" }
    })
    @IsNotEmpty()
    customerContactNo: { dialCode: string; contactNumber: string };
}

