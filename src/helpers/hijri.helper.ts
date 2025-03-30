// src/helpers/hijri.helper.ts
import { Injectable } from '@nestjs/common';
import { toHijri } from 'hijri-converter'; // Library konversi ke Hijri

@Injectable()
export default class HijriHelper {
  // Daftar nama bulan Hijriah dalam bahasa Inggris
  private readonly hijriMonths = [
    'Muharam', 'Safar', 'Rabi al-Awwal', 'Rabi al-Akhir',
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Sya\'ban',
    'Ramadan', 'Syawal', 'Dzul-Qa\'dah', 'Dzul-Hijjah'
  ];

  /**
   * Konversi tanggal Gregorian ke Hijriah
   * @param date Tanggal dalam bentuk Date object, ISO string, atau timestamp
   * @returns Objek berisi detail tanggal Hijriah
   */
  toHijri(date: Date | string | number) {
    // Buat Date object dari berbagai input format
    const d = new Date(date);
    if (isNaN(d.getTime())) throw new Error('Invalid date format');

    // Konversi ke Hijri menggunakan library
    const { hd, hm, hy } = toHijri(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate()
    );

    return {
      day: hd,                           // Tanggal (1-30)
      month: this.hijriMonths[hm - 1],    // Nama bulan
      monthIndex: hm,                    // Nomor bulan (1-12)
      year: hy,                          // Tahun Hijriah
      notation: 'H',                     // Notasi Hijriah
      formatted: `${hd} ${this.hijriMonths[hm - 1]} ${hy} H`, // Format lengkap
      gregorian: d.toISOString()          // Tanggal Gregorian asli
    };
  }

  /**
   * Konversi tanggal Hijriah ke Gregorian (approximasi)
   * @param day Tanggal (1-30)
   * @param month Bulan (1-12)
   * @param year Tahun Hijriah
   */
  fromHijri(day: number, month: number, year: number): Date {
    // Pendekatan sederhana dengan asumsi 1 tahun = 354 hari
    const approxDays = year * 354 + (month - 1) * 29.5 + day;
    const gregorianDate = new Date(622, 6, 16); // Tanggal awal kalender Hijriah
    gregorianDate.setDate(gregorianDate.getDate() + Math.round(approxDays));
    return gregorianDate;
  }

  /**
   * Parsing string tanggal Hijriah ke Date object Gregorian
   * @param hijriString Format: 'DD MonthName YYYY' (contoh: '15 Ramadan 1444')
   */
  parseHijri(hijriString: string): Date {
    // Bersihkan dan split string input
    const cleaned = hijriString
      .replace(/[hH,]/g, '')  // Hapus karakter H/h dan koma
      .trim()
      .split(/\s+/);          // Split berdasarkan spasi

    if (cleaned.length !== 3) {
      throw new Error('Invalid format. Use: "DD MonthName YYYY"');
    }

    // Ekstrak komponen tanggal
    const day = parseInt(cleaned[0]);
    const monthName = cleaned[1].toLowerCase();
    const year = parseInt(cleaned[2]);

    // Cari index bulan berdasarkan nama
    const monthIndex = this.hijriMonths
      .map(m => m.toLowerCase())
      .findIndex(m => m.includes(monthName));

    if (monthIndex === -1) {
      throw new Error(`Invalid month. Valid: ${this.hijriMonths.join(', ')}`);
    }

    // Konversi ke Gregorian
    return this.fromHijri(day, monthIndex + 1, year);
  }

  /**
   * Mendapatkan tanggal Hijriah saat ini
   */
  getCurrentHijri() {
    return this.toHijri(new Date());
  }

  /**
   * Validasi string tanggal Hijriah
   */
  isValidHijri(hijriString: string): boolean {
    try {
      this.parseHijri(hijriString);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Format ulang string tanggal Hijriah
   * @param format Pattern dengan DD, MM, MMM, YYYY
   * Contoh: 'DD-MM-YYYY' => '15-09-1444'
   */
  formatHijri(hijriString: string, format: string): string {
    const date = this.parseHijri(hijriString);
    const hijri = this.toHijri(date);

    return format
      .replace('DD', hijri.day.toString().padStart(2, '0'))  // Tanggal 2 digit
      .replace('MM', hijri.monthIndex.toString().padStart(2, '0')) // Bulan 2 digit
      .replace('MMM', hijri.month.substring(0, 3))           // Singkatan bulan
      .replace('YYYY', hijri.year.toString());               // Tahun 4 digit
  }
}