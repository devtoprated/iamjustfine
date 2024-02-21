import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class checkInDto {

    @ApiProperty({ example: "Ok" })
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: "I am doing fine" })
    @IsOptional()
    detail: string;
}
