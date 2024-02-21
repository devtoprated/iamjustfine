import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class GetNotificationDto {
    @ApiProperty({ example: 1 })
    pageNo: number;
}