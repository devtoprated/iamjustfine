import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class DeleteNotificationDto {
    @ApiProperty({ example: ['dcfc2243-c429-492a-b560-b20330be4428'] })
    @IsNotEmpty()
    id: string;
}
