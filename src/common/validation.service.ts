import { Injectable } from '@nestjs/common';
import { ZodType } from 'zod';

@Injectable()
export class ValidationService {
    validate<T>(zodType: ZodType<T>, data: unknown): T {
        const result = zodType.safeParse(data);
        if (!result.success) {
            throw result.error; // Throw ZodError directly
        }
        return result.data;
    }
}