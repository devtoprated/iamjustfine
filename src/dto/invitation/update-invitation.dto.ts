import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateInvitationDto {

    @ApiProperty({ example: 'ba1f42b7-d26b-4e67-997f-c74bf4caba7c' })
    @IsNotEmpty()
    invitationId: string;

    @ApiProperty({ example: 'accepted , removed' })
    @IsNotEmpty()
    status: string;

}
