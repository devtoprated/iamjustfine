import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class PushNotificationDto {
    @ApiProperty({ example: 'eNFlui3b9UVrvNAbYLgXyC:APA91bGQi0k_pettAoMZsBHsjBvY2wEvI54e4oka6hnt6D8F46hGqtkuYMlS_H1rpQIugoY0S-vh-dO5A-PVz7nlF0xuIHktnfZkiKCWGjI6DqyuJyhw2cdxdRE0FzaoYIHFlhQBILYR' })
    @IsNotEmpty()
    token: string;

    @ApiProperty({
        example: `{"notification":{"body":"Hello Alert","title":"tester","sound":"default"},"data":{"completeObj":"","type":"1","moduleName":"2","severity":"1"}}`
    })
    @IsNotEmpty()
    payload: object
}
