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
exports.UserMonitor = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const user_entity_1 = require("./user.entity");
let UserMonitor = class UserMonitor extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], UserMonitor.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], UserMonitor.prototype, "helperId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], UserMonitor.prototype, "isCurrentMonitor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (users) => users.careReceivers),
    (0, typeorm_1.JoinColumn)({ name: "userId" }),
    __metadata("design:type", user_entity_1.Users)
], UserMonitor.prototype, "careReceivers", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Users, (users) => users.helpers),
    __metadata("design:type", user_entity_1.Users)
], UserMonitor.prototype, "helper", void 0);
UserMonitor = __decorate([
    (0, typeorm_1.Entity)('helpers')
], UserMonitor);
exports.UserMonitor = UserMonitor;
//# sourceMappingURL=user-monitor.entity.js.map