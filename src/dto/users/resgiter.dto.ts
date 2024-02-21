import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class RegisterDto {

    @ApiProperty({ example: "Test" })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "1234567890" })
    @IsNotEmpty()
    contactNumber: string;

    @ApiProperty({ example: "+91" })
    @IsNotEmpty()
    dialCode: string;

    @ApiProperty({ example: "IOS" })
    @IsNotEmpty()
    deviceType: string;

    @ApiProperty()
    @IsNotEmpty()
    deviceToken: string;

    @ApiProperty({ example: "GMT", required: false })
    userTimezone: string;
}
