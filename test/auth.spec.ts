// test/auth.spec.ts
/**
 * TEST SPECIFICATION FOR AUTH CONTROLLER
 * 
 * File ini berisi test suite komprehensif untuk menguji semua fungsionalitas
 * yang terkait dengan autentikasi (register, login, logout) beserta validasinya.
 * Test suite ini menggunakan Jest sebagai test runner dan SuperTest untuk HTTP testing.
 */

// Import modul-modul yang diperlukan
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { TestService } from './test.service';
import { TestModule } from './test.module';
import { ValidationService } from '../src/common/validation.service';
import { AuthValidation } from '../src/auth/auth.validation';
import { RegisterAuthRequest } from '../src/model/auth.model';

/**
 * Test suite utama untuk AuthController
 */
describe('AuthController', () => {
  // Variabel untuk instance aplikasi NestJS
  let app: INestApplication;
  // Logger untuk pencatatan log selama testing
  let logger: Logger;
  // Service untuk operasi test seperti clean database
  let testService: TestService;
  // Service untuk validasi data
  let validationService: ValidationService;

  /**
   * Setup sebelum semua test dijalankan
   * - Membuat module testing
   * - Menginisialisasi aplikasi NestJS
   * - Mengambil instance yang diperlukan dari dependency injection
   */
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule], // Import modul utama dan modul test
    }).compile();

    // Buat aplikasi NestJS dari module testing
    app = moduleFixture.createNestApplication();
    await app.init(); // Inisialisasi aplikasi

    // Dapatkan instance yang diperlukan
    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
    validationService = app.get(ValidationService);
  });

  /**
   * Setup sebelum setiap test case
   * - Membersihkan database untuk memastikan test isolation
   */
  beforeEach(async () => {
    await testService.cleanDatabase();
  });

  /**
   * Cleanup setelah semua test selesai
   * - Tutup aplikasi NestJS
   */
  afterAll(async () => {
    await app.close();
  });

  /**
   * TEST GROUP: VALIDASI DATA
   * Menguji semua skenario validasi untuk registrasi user
   */
  describe('Validation Tests', () => {
    // Test validasi data yang benar
    it('should validate correct registration data', () => {
      const validData = {
        username: 'valid.user',
        email: 'valid@email.com',
        password: 'ValidPass123'
      };
      // Harus tidak throw error
      expect(() => validationService.validate(AuthValidation.REGISTER, validData)).not.toThrow();
    });

    /**
     * SUBGROUP: VALIDASI USERNAME
     * Menguji semua skenario validasi untuk username
     */
    describe('Username Validation', () => {
      // Data dasar yang akan digunakan untuk test username
      const baseData = {
        email: 'test@email.com',
        password: 'ValidPass123'
      };

      // Test untuk username kosong
      it('should reject empty username', () => {
        const data = { ...baseData, username: '' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username harus minimal 3 karakter'
        );
      });

      // Test untuk username dengan spasi
      it('should reject username with spaces', () => {
        const data = { ...baseData, username: 'invalid user' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username tidak boleh mengandung spasi'
        );
      });

      // Test untuk username yang dimulai dengan angka
      it('should reject username starting with number', () => {
        const data = { ...baseData, username: '1invalid' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username tidak boleh diawali dengan angka'
        );
      });

      // Test untuk username yang dimulai dengan titik
      it('should reject username starting with dot', () => {
        const data = { ...baseData, username: '.invalid' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username tidak boleh diawali dengan titik atau underscore'
        );
      });

      // Test untuk username dengan karakter tidak valid
      it('should reject username with invalid characters', () => {
        const data = { ...baseData, username: 'invalid@user' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username hanya boleh mengandung huruf kecil, angka, titik (.), dan underscore (_)'
        );
      });

      // Test untuk username terlalu pendek
      it('should reject too short username', () => {
        const data = { ...baseData, username: 'ab' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username harus minimal 3 karakter'
        );
      });

      // Test untuk username terlalu panjang
      it('should reject too long username', () => {
        const data = { ...baseData, username: 'a'.repeat(21) };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username maksimal 20 karakter'
        );
      });
    });

    /**
     * SUBGROUP: VALIDASI EMAIL
     * Menguji semua skenario validasi untuk email
     */
    describe('Email Validation', () => {
      // Data dasar untuk test email
      const baseData = {
        username: 'valid.user',
        password: 'ValidPass123'
      };

      // Test untuk email kosong
      it('should reject empty email', () => {
        const data = { ...baseData, email: '' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Format email tidak valid'
        );
      });

      // Test untuk berbagai format email tidak valid
      it('should reject invalid email format', () => {
        const invalidEmails = [
          'plainstring',
          'missing@dot',
          'invalid@.com',
          '@missingusername.com',
          'spaces in@email.com'
        ];

        invalidEmails.forEach(email => {
          const data = { ...baseData, email };
          expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
            'Format email tidak valid'
          );
        });
      });

      // Test untuk email dengan karakter tidak valid
      it('should reject email with invalid characters', () => {
        const data = { ...baseData, email: 'invalid@char$.com' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Format email tidak diperbolehkan'
        );
      });
    });

    /**
     * SUBGROUP: VALIDASI PASSWORD
     * Menguji semua skenario validasi untuk password
     */
    describe('Password Validation', () => {
      // Data dasar untuk test password
      const baseData = {
        username: 'valid.user',
        email: 'valid@email.com'
      };

      // Test untuk password kosong
      it('should reject empty password', () => {
        const data = { ...baseData, password: '' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus minimal 8 karakter'
        );
      });

      // Test untuk password terlalu pendek
      it('should reject too short password', () => {
        const data = { ...baseData, password: 'Short1' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus minimal 8 karakter'
        );
      });

      // Test untuk password tanpa huruf besar
      it('should reject password without uppercase', () => {
        const data = { ...baseData, password: 'lowercase123' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka'
        );
      });

      // Test untuk password tanpa huruf kecil
      it('should reject password without lowercase', () => {
        const data = { ...baseData, password: 'UPPERCASE123' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka'
        );
      });

      // Test untuk password tanpa angka
      it('should reject password without numbers', () => {
        const data = { ...baseData, password: 'NoNumbersHere' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka'
        );
      });
    });
  });

  /**
   * TEST GROUP: ENDPOINT REGISTER
   * Menguji semua skenario untuk endpoint /auth/register
   */
  describe('POST /auth/register', () => {
    // Test untuk berbagai kasus request tidak valid
    it('should be rejected if request is invalid', async () => {
      const invalidRequests = [
        { username: '', password: '', email: '' },
        { username: 'test', password: 'TestDebug123', email: 'invalid-email' },
        { username: 'test', password: 'weak', email: 'test@debug.com' },
        { username: '1test', password: 'TestDebug123', email: 'test@debug.com' },
        { username: 'test debug', password: 'TestDebug123', email: 'test@debug.com' }
      ];

      // Loop melalui semua kasus tidak valid
      for (const body of invalidRequests) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(body);

        // Verifikasi response
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
        logger.info(`Validation error for ${JSON.stringify(body)}:`, response.body.errors);
      }
    });

    // Test untuk registrasi dengan data valid
    it('should be able to register with valid data', async () => {
      const validData = {
        username: 'test.debug',
        password: 'TestDebug123',
        email: 'test@debug.com'
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(validData);

      logger.info('Registration response:', response.body);

      // Verifikasi response sukses
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(validData.username);
      expect(response.body.data.email).toBe(validData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.isActive).toBe(true);
    });

    // Test untuk username yang sudah ada
    it('should be rejected if username already exists', async () => {
      // Buat user terlebih dahulu
      await testService.createTestUser();

      // Coba registrasi dengan username yang sama
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test.debug',
          password: 'DifferentPass123',
          email: 'different@email.com'
        });

      logger.info('Duplicate username response:', response.body);

      // Verifikasi response conflict
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username sudah terdaftar');
    });

    // Test untuk email yang sudah ada
    it('should be rejected if email already exists', async () => {
      // Buat user terlebih dahulu
      await testService.createTestUser();

      // Coba registrasi dengan email yang sama
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'different.user',
          password: 'DifferentPass123',
          email: 'test@debug.com'
        });

      logger.info('Duplicate email response:', response.body);

      // Verifikasi response conflict
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email sudah digunakan');
    });

    // Test untuk case sensitivity username dan email
    it('should be case sensitive for username but insensitive for email', async () => {
      // Buat user terlebih dahulu
      await testService.createTestUser();

      // Test case sensitivity untuk username (harus berbeda karena case sensitive)
      const usernameResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'TEST.DEBUG', // Different case
          password: 'TestDebug123',
          email: 'new@email.com'
        });

      expect(usernameResponse.status).toBe(400); // Seharusnya sukses karena case sensitive

      // Test case insensitivity untuk email (harus conflict karena case insensitive)
      const emailResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'new.user',
          password: 'TestDebug123',
          email: 'TEST@DEBUG.COM' // Different case
        });

      expect(emailResponse.status).toBe(409); // Seharusnya conflict karena email case insensitive
    });
  });

  /**
   * TEST GROUP: ENDPOINT LOGIN
   * Menguji semua skenario untuk endpoint /auth/login
   */
  describe('POST /auth/login', () => {
    // Data user test
    const testUser = {
      username: 'test.debug',
      password: 'TestDebug123',
      email: 'test@debug.com'
    };

    // Setup sebelum setiap test - buat user terlebih dahulu
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    // Test login dengan kredensial benar
    it('should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      logger.info('Login response:', response.body);

      // Verifikasi response sukses
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.token).toBeDefined();
    });

    // Test login dengan password salah
    it('should reject login with incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: 'WrongPassword123'
        });

      logger.info('Failed login response:', response.body);

      // Verifikasi response unauthorized
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Username atau password salah');
    });

    // Test login dengan username yang tidak ada
    it('should reject login with non-existent username', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent.user',
          password: 'SomePassword123'
        });

      logger.info('Non-existent user login response:', response.body);

      // Verifikasi response unauthorized
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Username atau password salah');
    });

    // Test login untuk akun yang tidak aktif
    it('should reject login for inactive account', async () => {
      // Nonaktifkan user terlebih dahulu
      await testService.deactivateUser(testUser.username);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      logger.info('Inactive account login response:', response.body);

      // Verifikasi response unauthorized
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Akun dinonaktifkan');
    });

    // Test validasi input login
    it('should validate login input', async () => {
      const invalidRequests = [
        { username: '', password: 'ValidPass123' },
        { username: 'test', password: '' },
        { username: 'invalid user', password: 'ValidPass123' },
        { username: 'test', password: 'short' }
      ];

      // Loop melalui semua kasus tidak valid
      for (const body of invalidRequests) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(body);

        // Verifikasi response bad request
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
        logger.info(`Login validation error for ${JSON.stringify(body)}:`, response.body.errors);
      }
    });
  });

  /**
   * TEST GROUP: ENDPOINT LOGOUT
   * Menguji semua skenario untuk endpoint /auth/logout
   */
  describe('DELETE /auth/logout', () => {
    let authToken: string;
    // Data user test
    const testUser = {
      username: 'test.debug',
      password: 'TestDebug123',
      email: 'test@debug.com'
    };

    // Setup sebelum setiap test - registrasi dan login untuk mendapatkan token
    beforeEach(async () => {
      // Register user
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      // Login untuk mendapatkan token
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      authToken = loginResponse.body.data.token;
    });

    // Test logout dengan token valid
    it('should logout successfully with valid token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      logger.info('Logout response:', response.body);

      // Verifikasi response sukses
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
    });

    // Test logout dengan token tidak valid
    it('should reject logout with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      logger.info('Invalid token logout response:', response.body);

      // Verifikasi response unauthorized
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired session');
    });

    // Test logout tanpa token
    it('should reject logout without token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/logout');

      logger.info('No token logout response:', response.body);

      // Verifikasi response unauthorized
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});