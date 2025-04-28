// src/pdf/pdf.module.ts

import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { ConfigModule } from '@nestjs/config';
import { StampModule } from 'src/stamp/stamp.module';
import { SignatureModule } from 'src/signature/signature.module';

@Module({
    imports: [ConfigModule, StampModule, SignatureModule],
    providers: [PdfService],
    exports: [PdfService],
})
export class PdfModule { }