import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class DashboardDto {

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    type: number;
}
