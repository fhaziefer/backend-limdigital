# Backend Digitalisasi LIM

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Deskripsi Proyek

**Backend Digitalisasi LIM** adalah sistem manajemen organisasi berbasis web yang dibangun dengan NestJS untuk meningkatkan efisiensi pengelolaan informasi dan administrasi di LIM.

## Fitur Utama

- **Manajemen Pengguna**: Autentikasi, otorisasi, dan pengelolaan profil
- **Struktur Organisasi**: Pengelolaan region, department, dan member
- **Surat Menyurat**: Pembuatan draft, approval, disposisi, dan pengarsipan surat
- **Pelacakan Aktivitas**: Audit log dan sistem notifikasi

## Teknologi

- **Backend**: NestJS, TypeScript, Prisma
- **Database**: MySQL
- **Validasi**: Zod
- **Logging**: Winston
- **File Storage**: Amazon S3

## Instalasi

```bash
# Install dependencies
$ npm install

# Setup environment
$ cp .env.example .env
```

## Menjalankan Proyek

```bash
# Development mode
$ npm run start:dev

# Production mode
$ npm run start:prod
```

## Testing

```bash
# Unit tests
$ npm run test

# E2E tests
$ npm run test:e2e

# Test coverage
$ npm run test:cov
```

## Dokumentasi API

Dokumentasi API tersedia di `/api/docs` setelah menjalankan server development.

## Struktur Proyek

```
src/
├── auth/           # Modul autentikasi
├── user/           # Manajemen pengguna
├── organization/   # Struktur organisasi
├── letter/         # Surat menyurat
├── audit/          # Pelacakan aktivitas
├── shared/         # Utilities dan shared modules
└── main.ts         # Entry point aplikasi
```

## Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b feature/namafitur`)
3. Commit perubahan (`git commit -m 'Tambahkan fitur baru'`)
4. Push ke branch (`git push origin feature/namafitur`)
5. Buat Pull Request

## Tim Pengembang

- **Project Manager**: [Nama PM]
- **Backend Developer**: [Nama Developer]
- **Database Administrator**: [Nama DBA]
- **DevOps Engineer**: [Nama DevOps]

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).