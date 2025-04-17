// src/pdf/pdf.service.ts

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as handlebars from 'handlebars';
import * as puppeteer from 'puppeteer';
import { ConfigService } from '@nestjs/config';
import { StampService } from '../stamp/stamp.service';
import { formatFullDate } from 'src/utils/date.util';
import { google, drive_v3 } from 'googleapis';

@Injectable()
export class PdfService {
    private readonly logger = new Logger(PdfService.name);
    private readonly templateDir = path.join(__dirname, '../../templates/letters');
    private readonly assetDir = path.join(__dirname, '../../src/assets');
    private readonly uploadDir = path.join(__dirname, '../../uploads');
    private readonly pdfDir = path.join(this.uploadDir, 'documents');
    private readonly imageDir = path.join(this.uploadDir, 'images');

    constructor(
        private configService: ConfigService,
        private stampService: StampService,
    ) {
        this.registerPartials();
        this.initializeDirectories().catch(err => {
            this.logger.error('Failed to initialize directories', err);
        });
    }

    private async initializeDirectories(): Promise<void> {
        try {
            await Promise.all([
                fs.promises.mkdir(this.pdfDir, { recursive: true }),
                fs.promises.mkdir(this.imageDir, { recursive: true })
            ]);
            
            this.logger.log('Directories initialized successfully', {
                pdfDir: this.pdfDir,
                imageDir: this.imageDir
            });
        } catch (error) {
            this.logger.error('Failed to initialize directories', {
                error: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    private async encodeImageToBase64(imagePath: string): Promise<string> {
        const fullPath = path.join(this.assetDir, imagePath);
        
        try {
            await fs.promises.access(fullPath, fs.constants.R_OK);
            const imageBuffer = await fs.promises.readFile(fullPath);
            return imageBuffer.toString('base64');
        } catch (error) {
            this.logger.error(`Failed to encode image: ${fullPath}`, {
                error: error.message,
                stack: error.stack
            });
            return '';
        }
    }

    private registerPartials() {
        const partialsDir = path.join(this.templateDir, 'partials');

        try {
            const partialFiles = fs.readdirSync(partialsDir);
            partialFiles.forEach(file => {
                const partialName = path.basename(file, '.hbs');
                const partialContent = fs.readFileSync(path.join(partialsDir, file), 'utf8');
                handlebars.registerPartial(partialName, partialContent);
            });
            this.logger.log(`Registered ${partialFiles.length} partial templates`);
        } catch (error) {
            this.logger.error('Failed to register partials', {
                error: error.message,
                stack: error.stack
            });
        }
    }

    private async getDriveService(): Promise<drive_v3.Drive> {
        const credentialString = this.configService.get<string>('GOOGLE_CREDENTIAL');

        if (!credentialString) {
            const error = new Error('Google Drive credentials not configured');
            this.logger.error(error.message);
            throw error;
        }

        try {
            const credentials = JSON.parse(credentialString);
            const authClient = new google.auth.JWT({
                email: credentials.client_email,
                key: credentials.private_key,
                scopes: ['https://www.googleapis.com/auth/drive.file'],
            });

            await authClient.authorize();
            this.logger.log('Google Drive service authenticated successfully');
            
            return google.drive({ version: 'v3', auth: authClient });
        } catch (error) {
            this.logger.error('Failed to initialize Google Drive service', {
                error: error.message,
                stack: error.stack
            });
            throw new Error(`Failed to initialize Google Drive: ${error.message}`);
        }
    }

    private async uploadFileToDrive(
        filePath: string,
        fileName: string,
        mimeType: string,
        isPdf: boolean
    ): Promise<string | null> {
        try {
            await fs.promises.access(filePath, fs.constants.R_OK);
            const driveService = await this.getDriveService();
            
            const folderId = isPdf
                ? this.configService.get('GOOGLE_DRIVE_PDF_FOLDER_ID')
                : this.configService.get('GOOGLE_DRIVE_IMAGE_FOLDER_ID');

            if (!folderId) {
                const error = new Error(`Google Drive folder ID for ${isPdf ? 'PDF' : 'Image'} not configured`);
                this.logger.error(error.message);
                throw error;
            }

            const fileMetadata = {
                name: fileName,
                parents: [folderId],
            };

            const media = {
                mimeType,
                body: fs.createReadStream(filePath),
            };

            this.logger.log(`Uploading ${isPdf ? 'PDF' : 'Image'} to Google Drive`, {
                filePath,
                fileName,
                folderId
            });

            const response = await driveService.files.create({
                requestBody: fileMetadata,
                media: media,
                fields: 'id',
            });

            await driveService.permissions.create({
                fileId: response.data.id as string,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });

            const fileUrl = `https://drive.google.com/file/d/${response.data.id}/view`;
            this.logger.log(`File uploaded successfully to Google Drive`, {
                fileUrl,
                fileId: response.data.id
            });

            return fileUrl;
        } catch (error) {
            this.logger.error(`Failed to upload ${isPdf ? 'PDF' : 'Image'} to Google Drive`, {
                error: error.message,
                stack: error.stack,
                filePath
            });
            return null;
        }
    }

    async generatePdfAndImage(data: any): Promise<{
        localPdfUrl: string;
        localImageUrl?: string;
        drivePdfUrl?: string;
        driveImageUrl?: string;
    }> {
        this.logger.log('Starting PDF and image generation process', {
            nomorSurat: data.nomorSurat
        });

        try {
            // Verify and create directories if needed
            await this.initializeDirectories();

            // Prepare stamp data
            const dateNow = new Date();
            const formattedDate = formatFullDate(dateNow);
            const stampText = `Surat nomor ${data.nomorSurat} resmi diterbitkan oleh ${data.tingkatKepengurusan} Lembaga Ittihadul Muballighin ${data.daerahKepengurusan} pada ${formattedDate}`;
            
            this.logger.log('Generating dynamic stamp');
            const dynamicStampBuffer = await this.stampService.generateQRCodeWithStamp(
                stampText, 
                data.tingkatKepengurusan.toUpperCase(), 
                data.daerahKepengurusan.toUpperCase()
            );
            const dynamicStampBase64 = dynamicStampBuffer.toString('base64');

            // Compile template
            this.logger.log('Compiling template');
            const images = {
                logoBase64: await this.encodeImageToBase64('images/logo_lim.png'),
                ketuaBase64: dynamicStampBase64,
                sekreBase64: dynamicStampBase64,
                stampBase64: dynamicStampBase64
            };

            const templateData = { ...data, ...images };
            const templatePath = path.join(this.templateDir, 'index.hbs');
            const templateContent = await fs.promises.readFile(templatePath, 'utf8');
            const template = handlebars.compile(templateContent);
            const html = template(templateData);

            // Generate PDF and image
            this.logger.log('Launching Puppeteer browser');
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security'],
            });

            try {
                const page = await browser.newPage();
                await page.setViewport({
                    width: 793,
                    height: 1122,
                    deviceScaleFactor: 2
                });

                this.logger.log('Generating PDF and screenshot');
                await page.setContent(html, { waitUntil: 'networkidle0' });

                const [pdfBuffer, imageBuffer] = await Promise.all([
                    page.pdf({ format: 'A4', printBackground: true }),
                    page.screenshot({ type: 'png', fullPage: true })
                ]);

                // Save files locally
                const timestamp = Date.now();
                const pdfFilename = `undangan_${timestamp}.pdf`;
                const imageFilename = `undangan_${timestamp}.png`;
                const pdfPath = path.join(this.pdfDir, pdfFilename);
                const imagePath = path.join(this.imageDir, imageFilename);

                this.logger.log('Saving files locally', { pdfPath, imagePath });
                await Promise.all([
                    fs.promises.writeFile(pdfPath, pdfBuffer),
                    fs.promises.writeFile(imagePath, imageBuffer)
                ]);

                // Verify files were written
                await Promise.all([
                    fs.promises.access(pdfPath, fs.constants.R_OK),
                    fs.promises.access(imagePath, fs.constants.R_OK)
                ]);

                // Prepare URLs
                const baseUrl = this.configService.get('BASE_URL') || 'http://localhost:3000';
                const localPdfUrl = `${baseUrl}/uploads/documents/${pdfFilename}`;
                const localImageUrl = `${baseUrl}/uploads/images/${imageFilename}`;

                let drivePdfUrl: string | undefined;
                let driveImageUrl: string | undefined;

                if (this.configService.get('GOOGLE_DRIVE_ENABLED') === 'true') {
                    this.logger.log('Google Drive upload enabled - starting upload');
                    const [pdfResult, imageResult] = await Promise.all([
                        this.uploadFileToDrive(pdfPath, pdfFilename, 'application/pdf', true),
                        this.uploadFileToDrive(imagePath, imageFilename, 'image/png', false)
                    ]);

                    drivePdfUrl = pdfResult || undefined;
                    driveImageUrl = imageResult || undefined;
                }

                this.logger.log('PDF and image generation completed successfully', {
                    localPdfUrl,
                    localImageUrl,
                    drivePdfUrl: !!drivePdfUrl,
                    driveImageUrl: !!driveImageUrl
                });

                return {
                    localPdfUrl,
                    localImageUrl,
                    drivePdfUrl,
                    driveImageUrl
                };
            } finally {
                await browser.close();
            }
        } catch (error) {
            this.logger.error('Failed to generate PDF and image', {
                error: error.message,
                stack: error.stack,
                nomorSurat: data.nomorSurat
            });
            throw error;
        }
    }
}