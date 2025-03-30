// src/common/common.module.ts
import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { PrismaService } from './prisma.module';
import { ValidationService } from './validation.service';
import { APP_FILTER } from '@nestjs/core';
import { ErrorFilter } from './error.filter';
import { ClientHelper } from '../helpers/client.helper';
import HijriHelper from 'src/helpers/hijri.helper';

@Global()
@Module({
    imports: [
        WinstonModule.forRoot({
            format: winston.format.json(),
            transports: [new winston.transports.Console()],
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
            validationOptions: {
                allowUnknown: true,
                abortEarly: false,
            },
        }),
    ],
    providers: [
        PrismaService,
        ValidationService,
        ClientHelper,
        HijriHelper,
        {
            provide: APP_FILTER,
            useClass: ErrorFilter,
        },
    ],
    exports: [
        PrismaService,
        ValidationService,
        ClientHelper,
        HijriHelper
    ],
})
export class CommonModule { }