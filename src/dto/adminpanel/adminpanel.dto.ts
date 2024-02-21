import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class adminpanelDto{

    @ApiProperty({ example: "John Doe" })
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 123456 })
    @IsOptional()
    password: string;
}
