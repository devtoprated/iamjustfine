
import { ApiProperty, ApiConsumes } from "@nestjs/swagger";
import { IsNotEmpty, isNumber, Max, MaxLength, MinLength, IsOptional, IsPositive } from "class-validator";

export class EditProfileDto {

    @ApiProperty()
    @IsOptional()
    name: string;

    @ApiProperty({ default: null })
    @IsOptional()
    contactNumber: string;

    @ApiProperty({ default: null })
    @IsOptional()
    dialCode: string;


    @ApiProperty()
    @IsOptional()
    picture: MediaImage;


    @ApiProperty()
    @IsOptional()
    isApprovedByAdmin: boolean;
}   