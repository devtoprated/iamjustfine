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
exports.AppConfiguration = void 0;
const typeorm_1 = require("typeorm");
const shared_entity_1 = require("./shared.entity");
const enum_1 = require("../enums/enum");
let AppConfiguration = class AppConfiguration extends shared_entity_1.SharedEntity {
};
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], AppConfiguration.prototype, "configurationFor", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: null }),
    __metadata("design:type", String)
], AppConfiguration.prototype, "latestAppVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: enum_1.Boolean.False }),
    __metadata("design:type", Boolean)
], AppConfiguration.prototype, "isForcefullyUpdateNeeded", void 0);
AppConfiguration = __decorate([
    (0, typeorm_1.Entity)('app_configurations')
], AppConfiguration);
exports.AppConfiguration = AppConfiguration;
//# sourceMappingURL=configuration.entity.js.map