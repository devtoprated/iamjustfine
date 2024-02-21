import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class StopMonitorDto {
    @ApiProperty({ example: "ba1f42b7-d26b-4e67-997f-c74bf4caba7c" })
    @IsNotEmpty()
    monitoringId: string;
}
