import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class SettingDto {

    @ApiProperty({ example: "07:00 PM", required: false })
    sleepStartTime: string;

    @ApiProperty({ example: "09:00 AM", required: false })
    sleepEndTime: string;


    @ApiProperty({ example: "30", required: false })
    checkinTime: string;
}
