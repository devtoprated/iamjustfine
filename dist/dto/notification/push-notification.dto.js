"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class PushNotificationDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'eNFlui3b9UVrvNAbYLgXyC:APA91bGQi0k_pettAoMZsBHsjBvY2wEvI54e4oka6hnt6D8F46hGqtkuYMlS_H1rpQIugoY0S-vh-dO5A-PVz7nlF0xuIHktnfZkiKCWGjI6DqyuJyhw2cdxdRE0FzaoYIHFlhQBILYR' }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], PushNotificationDto.prototype, "token", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: `{"notification":{"body":"Hello Alert","title":"tester","sound":"default"},"data":{"completeObj":"","type":"1","moduleName":"2","severity":"1"}}`
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Object)
], PushNotificationDto.prototype, "payload", void 0);
exports.PushNotificationDto = PushNotificationDto;
//# sourceMappingURL=push-notification.dto.js.map