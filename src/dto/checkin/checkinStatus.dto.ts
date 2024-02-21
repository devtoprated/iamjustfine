import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class checkinStatusInDto {

    @ApiProperty({ example: "I am great" })
    @IsNotEmpty()
    detail: string;
}
