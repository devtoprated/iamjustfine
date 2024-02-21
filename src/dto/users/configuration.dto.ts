
import { ApiProperty, ApiConsumes } from "@nestjs/swagger";
import { IsNotEmpty, isNumber, Max, MaxLength, MinLength, IsOptional, IsPositive } from "class-validator";

export class ConfigurationDto {
    @ApiProperty({ example: '+91' })
    @IsNotEmpty()
    dialCode: string;

    @ApiProperty({ example: 1234567890 })
    @IsNotEmpty()
    contactNumber: number;
}   