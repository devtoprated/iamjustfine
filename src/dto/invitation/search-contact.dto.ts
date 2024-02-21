import { Optional } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { IsEmpty } from "class-validator";
import { IsNotEmpty, IsOptional } from "class-validator";

export class SearchContactsDto {
    @ApiProperty({ example: '1234567890', required: false })
    contact?: '';

    @ApiProperty({ example: 1, required: false })
    type?: number;
}
