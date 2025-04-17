// src/undangan/undangan.service.ts

import { Injectable } from '@nestjs/common';
import { PdfService } from '../pdf/pdf.service';
import { CreateUndanganRequest } from 'src/model/letter.model';

@Injectable()
export class UndanganService {
    constructor(private pdfService: PdfService) { }

    private readonly arabicTitles = {
        'Pengurus Pusat': 'الإدارة المركزية لجنة اتحاد المبلغين',
        'Pengurus Wilayah': 'الإدارة المقاطعية لجنة إتحاد المبلغين',
        'Pengurus Cabang': 'الإدارة الفرعية لجنة إتحاد المبلغين',
        'default': 'الإدارة المنطقية لجنة إتحاد المبلغين'
    };

    async generateUndangan(createUndanganRequest: CreateUndanganRequest) {
        // Format data untuk template

        const arabic: String = this.arabicTitles[createUndanganRequest.tingkatKepengurusan] || this.arabicTitles.default;

        const templateData = {
            ...createUndanganRequest, arabic,
            tanggalPembuatan: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            }),
        };

        // Generate PDF
        const pdfUrl = await this.pdfService.generatePdfAndImage(templateData);

        return {
            success: true,
            message: 'Undangan berhasil dibuat',
            downloadUrl: pdfUrl,
        };
    }
}