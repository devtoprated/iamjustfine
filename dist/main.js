"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const express_session_1 = __importDefault(require("express-session"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const express_flash_1 = __importDefault(require("express-flash"));
const rawBody_middleware_1 = __importDefault(require("./webhook/rawBody.middleware"));
let serviceAccount = require(`${process.cwd()}/src/config/firebase.json`);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, rawBody_middleware_1.default)());
    const config = new swagger_1.DocumentBuilder()
        .setTitle('I Am Just Fine')
        .setDescription('I am just fine API list')
        .setVersion('1.0')
        .addTag('JustFine')
        .addServer(process.env.nodeSwaggerSiteUrl)
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
    })
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('documentation', app, document);
    app.use((0, express_session_1.default)({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    }));
    app.use(function (req, res, next, err) {
        next();
    });
    module.exports = firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount)
    });
    app.enableCors();
    app.setBaseViewsDir((0, path_1.join)(__dirname, '..', 'views'));
    app.setViewEngine('ejs');
    app.useGlobalPipes(new common_1.ValidationPipe());
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'public/'));
    app.use((0, express_flash_1.default)());
    await app.listen(process.env.APP_PORT);
}
bootstrap();
//# sourceMappingURL=main.js.map