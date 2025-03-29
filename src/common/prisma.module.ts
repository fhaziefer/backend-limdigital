// src/common/prisma.module.ts
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    ) {
        super({
            log: [
                { emit: 'event', level: 'query' },
                { emit: 'event', level: 'error' },
                { emit: 'event', level: 'info' },
                { emit: 'event', level: 'warn' },
            ],
        });
    }

    async onModuleInit() {
        await this.$connect();

        this.$on('query' as never, (e: any) => {
            this.logger.debug('Query: ' + e.query);
            this.logger.debug('Params: ' + e.params);
            this.logger.debug('Duration: ' + e.duration + 'ms');
        });

        this.$on('error' as never, (e: any) => {
            this.logger.error('Error: ' + e.message);
        });

        this.$on('info' as never, (e: any) => {
            this.logger.info('Info: ' + e.message);
        });

        this.$on('warn' as never, (e: any) => {
            this.logger.warn('Warning: ' + e.message);
        });
    }
}