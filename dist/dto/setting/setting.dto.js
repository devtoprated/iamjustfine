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
exports.SettingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class SettingDto {
}
__decorate([
    (0, swagger_1.ApiProperty)({ example: "07:00 PM", required: false }),
    __metadata("design:type", String)
], SettingDto.prototype, "sleepStartTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "09:00 AM", required: false }),
    __metadata("design:type", String)
], SettingDto.prototype, "sleepEndTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: "30", required: false }),
    __metadata("design:type", String)
], SettingDto.prototype, "checkinTime", void 0);
exports.SettingDto = SettingDto;
//# sourceMappingURL=setting.dto.js.map