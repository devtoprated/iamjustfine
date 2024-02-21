import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class VerifyProfileOtpDto {

    @ApiProperty({ example: "123456" })
    @IsNotEmpty()
    otp: number;
}
