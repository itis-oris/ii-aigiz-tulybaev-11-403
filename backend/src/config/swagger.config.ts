import {DocumentBuilder} from "@nestjs/swagger";

export function getSwaggerConfig() {
    return new DocumentBuilder()
        .setTitle('Sprintly API')
        .setDescription(
            'Документация API сервиса Sprintly. ' +
            'Для защищенных маршрутов используйте access token через кнопку Authorize. ' +
            'Маршруты обновления сессии работают через cookie refreshToken.'
        )
        .setVersion('1.0.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Вставьте JWT access token без префикса Bearer.',
            },
            'access-token'
        )
        .addCookieAuth(
            'refreshToken',
            {
                type: 'apiKey',
                in: 'cookie',
                name: 'refreshToken',
                description: 'HttpOnly cookie для обновления access token.',
            },
            'refresh-token'
        )
        .build()
}
