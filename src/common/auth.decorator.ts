// src/common/auth.decorator.ts
import { createParamDecorator, ExecutionContext, HttpException } from "@nestjs/common";

/**
 * Custom decorator untuk mendapatkan user yang terautentikasi
 * @throws HttpException 401 Jika user tidak terautentikasi
 */
export const Auth = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new HttpException('Unauthorized', 401);
        }

        return user;
    }
);