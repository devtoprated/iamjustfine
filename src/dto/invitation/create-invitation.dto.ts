import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class InvitationDto {

    @ApiProperty({ example: 1 })
    @IsNotEmpty()
    type: number;

    @ApiProperty({ example: 'Johan', required: false })
    name: string;

    @ApiProperty({ example: '+91' })
    @IsOptional()
    dialCode: string;

    @ApiProperty({ example: '1784523691' })
    @IsOptional()
    contactNumber: string;

}
