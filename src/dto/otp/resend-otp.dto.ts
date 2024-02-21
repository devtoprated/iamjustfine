import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class ResendOtp {

    @ApiProperty({ example: "+91" })
    @IsNotEmpty()
    dialCode: string;

    @ApiProperty({ example: "1234567890" })
    @IsNotEmpty()
    contactNumber: number;

}
