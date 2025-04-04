// src/common/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import * as path from 'path';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    // Logger untuk mencatat aktivitas service
    private readonly logger = new Logger(MailService.name);

    // Transporter untuk mengirim email
    private transporter: nodemailer.Transporter;

    constructor(private readonly configService: ConfigService) {
        // Inisialisasi transporter saat service dibuat
        this.initializeTransporter();
    }

    /**
     * Menginisialisasi transporter email dengan konfigurasi dari environment
     * @throws Error Jika gagal menginisialisasi transporter
     */
    private async initializeTransporter() {
        // Konfigurasi SMTP dari environment variables
        const mailConfig = {
            host: this.configService.get<string>('MAIL_HOST'),      // Host SMTP
            port: this.configService.get<number>('MAIL_PORT'),      // Port SMTP
            secure: false,                                          // false untuk port 587, true untuk 465
            auth: {
                user: this.configService.get<string>('MAIL_USER'),  // Email pengirim
                pass: this.configService.get<string>('MAIL_PASSWORD'), // Password/App Password
            },
            tls: {
                // Nonaktifkan verifikasi sertifikat SSL (hanya untuk development)
                rejectUnauthorized: false
            }
        };

        try {
            // Buat transporter nodemailer
            this.transporter = nodemailer.createTransport(mailConfig);

            // Verifikasi koneksi ke server SMTP
            await new Promise((resolve, reject) => {
                this.transporter.verify((error) => {
                    if (error) {
                        this.logger.error('SMTP Connection Error:', error);
                        reject(error);
                    } else {
                        this.logger.log('SMTP Connection Verified');
                        resolve(true);
                    }
                });
            });

        } catch (error) {
            this.logger.error('Failed to initialize mail transporter', error);
            throw error;
        }
    }

    /**
     * Mengirim email menggunakan template Handlebars
     * @param to Alamat email penerima
     * @param subject Subjek email
     * @param templateName Nama file template (tanpa ekstensi .hbs)
     * @param context Data untuk di-render di template
     * @throws Error Jika gagal mengirim email
     */
    async sendEmail(
        to: string,
        subject: string,
        templateName: string,
        context: Record<string, any>
    ): Promise<void> {
        try {
            // Dapatkan path lengkap ke file template
            const templatePath = path.join(
                __dirname,
                '../../templates/emails',
                `${templateName}.hbs`
            );

            // Baca konten template dari file
            const templateContent = readFileSync(templatePath, 'utf-8');

            // Compile template Handlebars
            const template = compile(templateContent);

            // Render template dengan data context
            const html = template(context);

            // Konfigurasi email yang akan dikirim
            const mailOptions = {
                from: `"${this.configService.get('MAIL_FROM_NAME')}" <${this.configService.get('MAIL_FROM_ADDRESS')}>`,
                to,
                subject,
                html, // Konten email dalam format HTML
            };

            // Kirim email
            await this.transporter.sendMail(mailOptions);

            this.logger.log(`Email sent to ${to}`);
        } catch (error) {
            // Log error lengkap untuk debugging
            this.logger.error(`Failed to send email to ${to}`, {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }
}