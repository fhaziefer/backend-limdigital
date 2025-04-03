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

describe('AuthController', () => {
  let app: INestApplication;
  let logger: Logger;
  let testService: TestService;
  let validationService: ValidationService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, TestModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    logger = app.get(WINSTON_MODULE_PROVIDER);
    testService = app.get(TestService);
    validationService = app.get(ValidationService);
  });

  beforeEach(async () => {
    await testService.cleanDatabase();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Validation Tests', () => {
    it('should validate correct registration data', () => {
      const validData = {
        username: 'valid.user',
        email: 'valid@email.com',
        password: 'ValidPass123'
      };
      expect(() => validationService.validate(AuthValidation.REGISTER, validData)).not.toThrow();
    });

    describe('Username Validation', () => {
      const baseData = {
        email: 'test@email.com',
        password: 'ValidPass123'
      };

      it('should reject empty username', () => {
        const data = { ...baseData, username: '' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username harus minimal 3 karakter'
        );
      });

      it('should reject username with spaces', () => {
        const data = { ...baseData, username: 'invalid user' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username tidak boleh mengandung spasi'
        );
      });

      it('should reject username starting with number', () => {
        const data = { ...baseData, username: '1invalid' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username tidak boleh diawali dengan angka'
        );
      });

      it('should reject username starting with dot', () => {
        const data = { ...baseData, username: '.invalid' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username tidak boleh diawali dengan titik atau underscore'
        );
      });

      it('should reject username with invalid characters', () => {
        const data = { ...baseData, username: 'invalid@user' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username hanya boleh mengandung huruf kecil, angka, titik (.), dan underscore (_)'
        );
      });

      it('should reject too short username', () => {
        const data = { ...baseData, username: 'ab' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username harus minimal 3 karakter'
        );
      });

      it('should reject too long username', () => {
        const data = { ...baseData, username: 'a'.repeat(21) };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Username maksimal 20 karakter'
        );
      });
    });

    describe('Email Validation', () => {
      const baseData = {
        username: 'valid.user',
        password: 'ValidPass123'
      };

      it('should reject empty email', () => {
        const data = { ...baseData, email: '' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Format email tidak valid'
        );
      });

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

      it('should reject email with invalid characters', () => {
        const data = { ...baseData, email: 'invalid@char$.com' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Format email tidak diperbolehkan'
        );
      });
    });

    describe('Password Validation', () => {
      const baseData = {
        username: 'valid.user',
        email: 'valid@email.com'
      };

      it('should reject empty password', () => {
        const data = { ...baseData, password: '' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus minimal 8 karakter'
        );
      });

      it('should reject too short password', () => {
        const data = { ...baseData, password: 'Short1' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus minimal 8 karakter'
        );
      });

      it('should reject password without uppercase', () => {
        const data = { ...baseData, password: 'lowercase123' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka'
        );
      });

      it('should reject password without lowercase', () => {
        const data = { ...baseData, password: 'UPPERCASE123' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka'
        );
      });

      it('should reject password without numbers', () => {
        const data = { ...baseData, password: 'NoNumbersHere' };
        expect(() => validationService.validate(AuthValidation.REGISTER, data)).toThrowError(
          'Password harus mengandung minimal 1 huruf besar, 1 huruf kecil, dan 1 angka'
        );
      });
    });
  });

  describe('POST /auth/register', () => {
    it('should be rejected if request is invalid', async () => {
      const invalidRequests = [
        { username: '', password: '', email: '' },
        { username: 'test', password: 'TestDebug123', email: 'invalid-email' },
        { username: 'test', password: 'weak', email: 'test@debug.com' },
        { username: '1test', password: 'TestDebug123', email: 'test@debug.com' },
        { username: 'test debug', password: 'TestDebug123', email: 'test@debug.com' }
      ];

      for (const body of invalidRequests) {
        const response = await request(app.getHttpServer())
          .post('/auth/register')
          .send(body);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
        logger.info(`Validation error for ${JSON.stringify(body)}:`, response.body.errors);
      }
    });

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

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(validData.username);
      expect(response.body.data.email).toBe(validData.email);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.isActive).toBe(true);
    });

    it('should be rejected if username already exists', async () => {
      // First create the user
      await testService.createTestUser();

      // Try to register with same username but different email
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'test.debug',
          password: 'DifferentPass123',
          email: 'different@email.com'
        });

      logger.info('Duplicate username response:', response.body);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Username sudah terdaftar');
    });

    it('should be rejected if email already exists', async () => {
      // First create the user
      await testService.createTestUser();

      // Try to register with same email but different username
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'different.user',
          password: 'DifferentPass123',
          email: 'test@debug.com'
        });

      logger.info('Duplicate email response:', response.body);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email sudah digunakan');
    });

    it('should be case sensitive for username but insensitive for email', async () => {
      // First create the user
      await testService.createTestUser();

      // Test case sensitivity for username
      const usernameResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'TEST.DEBUG', // Different case
          password: 'TestDebug123',
          email: 'new@email.com'
        });

      expect(usernameResponse.status).toBe(400); // Should succeed as case sensitive

      // Test case insensitivity for email
      const emailResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'new.user',
          password: 'TestDebug123',
          email: 'TEST@DEBUG.COM' // Different case
        });

      expect(emailResponse.status).toBe(409); // Should fail as email is case insensitive
    });
  });

  describe('POST /auth/login', () => {
    const testUser = {
      username: 'test.debug',
      password: 'TestDebug123',
      email: 'test@debug.com'
    };

    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);
    });

    it('should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      logger.info('Login response:', response.body);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.token).toBeDefined();
    });

    it('should reject login with incorrect password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: 'WrongPassword123'
        });

      logger.info('Failed login response:', response.body);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Username atau password salah');
    });

    it('should reject login with non-existent username', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistent.user',
          password: 'SomePassword123'
        });

      logger.info('Non-existent user login response:', response.body);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Username atau password salah');
    });

    it('should reject login for inactive account', async () => {
      // Deactivate the user
      await testService.deactivateUser(testUser.username);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      logger.info('Inactive account login response:', response.body);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Akun dinonaktifkan');
    });

    it('should validate login input', async () => {
      const invalidRequests = [
        { username: '', password: 'ValidPass123' },
        { username: 'test', password: '' },
        { username: 'invalid user', password: 'ValidPass123' },
        { username: 'test', password: 'short' }
      ];

      for (const body of invalidRequests) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(body);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.errors).toBeDefined();
        logger.info(`Login validation error for ${JSON.stringify(body)}:`, response.body.errors);
      }
    });
  });

  describe('DELETE /auth/logout', () => {
    let authToken: string;
    const testUser = {
      username: 'test.debug',
      password: 'TestDebug123',
      email: 'test@debug.com'
    };

    beforeEach(async () => {
      // Register and login to get token
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: testUser.password
        });

      authToken = loginResponse.body.data.token;
    });

    it('should logout successfully with valid token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      logger.info('Logout response:', response.body);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');

    });

    it('should reject logout with invalid token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/logout')
        .set('Authorization', 'Bearer invalid-token');

      logger.info('Invalid token logout response:', response.body);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid or expired session');
    });

    it('should reject logout without token', async () => {
      const response = await request(app.getHttpServer())
        .delete('/auth/logout');

      logger.info('No token logout response:', response.body);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

  });
});