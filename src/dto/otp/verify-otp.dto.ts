import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class VerifyOtpDto {

    @ApiProperty({ example: "+91" })
    @IsNotEmpty()
    dialCode: string;

    @ApiProperty({ example: "1234567890" })
    @IsNotEmpty()
    contactNumber: number;

    @ApiProperty({ example: "123456" })
    @IsNotEmpty()
    otp: number;
}
