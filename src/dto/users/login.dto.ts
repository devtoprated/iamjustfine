import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDto {

    @ApiProperty({ example: "Test" })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: '+91' })
    @IsNotEmpty()
    dialCode: string;

    @ApiProperty({ example: 1234567890 })
    @IsNotEmpty()
    contactNumber: number;

    @ApiProperty({ required: false })
    isDuplicateLogin: boolean;

    @ApiProperty({ example: "wefwefewfwe", required: false })
    deviceToken: number;

    @ApiProperty({ example: "fewfewfwefefw", required: false })
    deviceType: number;

    @ApiProperty({ example: "GMT", required: false })
    userTimezone: number;
}
