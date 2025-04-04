// src/common/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import { createTransport } from 'nodemailer';
import * as hbs from 'nodemailer-express-handlebars';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        this.transporter = createTransport({
            host: this.configService.get<string>('MAIL_HOST'),
            port: this.configService.get<number>('MAIL_PORT'),
            secure: this.configService.get<boolean>('MAIL_SECURE'),
            auth: {
                user: this.configService.get<string>('MAIL_USER'),
                pass: this.configService.get<string>('MAIL_PASSWORD'),
            },
        });

        // Setup template engine dengan benar
        const handlebarOptions = {
            viewEngine: {
                extname: '.hbs',
                layoutsDir: path.join(__dirname, '../../templates/emails'),
                defaultLayout: false,
            },
            viewPath: path.join(__dirname, '../../templates/emails'),
            extName: '.hbs',
        };

        this.transporter.use('compile', hbs(handlebarOptions));
    }

    async sendVerificationEmail(
        to: string,
        subject: string,
        template: string,
        context: any
    ): Promise<void> {
        const mailOptions = {
            from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
            to,
            subject,
            template, // Nama file template (tanpa ekstensi .hbs)
            context,  // Data yang akan di-render di template
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('Gagal mengirim email:', error);
            throw error;
        }
    }
}