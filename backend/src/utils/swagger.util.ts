import {SwaggerModule} from "@nestjs/swagger";
import {INestApplication} from "@nestjs/common";
import {getSwaggerConfig} from "../config/swagger.config";


export function setupSwagger(app: INestApplication) {
    const config = getSwaggerConfig();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
}