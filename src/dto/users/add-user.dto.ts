import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class addUserDto {

    @ApiProperty({ example: "Test" })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "1234567890" })
    @IsNotEmpty()
    contactNumber: string;

    @ApiProperty({ example: "+91" })
    @IsNotEmpty()
    dialCode: string;

    @ApiProperty({ example: "0" })
    @IsNotEmpty()
    isApprovedByAdmin: string;


}
