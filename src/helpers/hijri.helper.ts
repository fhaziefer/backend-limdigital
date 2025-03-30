// src/helpers/hijri.helper.ts
import { Injectable } from '@nestjs/common';
import { toHijri } from 'hijri-converter';

@Injectable()
export default class HijriHelper {
  private readonly hijriMonths = [
    'Muharam', 'Safar', 'Rabi al-Awwal', 'Rabi al-Akhir',
    'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', 'Sya\'ban',
    'Ramadan', 'Syawal', 'Dzul-Qa\'dah', 'Dzul-Hijjah'
  ];

  /**
   * Convert Gregorian date to Hijri format
   * @param date Date object, ISO string, or timestamp
   */
  toHijri(date: Date | string | number) {
    const d = new Date(date);
    if (isNaN(d.getTime())) throw new Error('Invalid date format');

    const { hd, hm, hy } = toHijri(
      d.getUTCFullYear(),
      d.getUTCMonth() + 1,
      d.getUTCDate()
    );

    return {
      day: hd,
      month: this.hijriMonths[hm - 1],
      monthIndex: hm,
      year: hy,
      notation: 'H',
      formatted: `${hd} ${this.hijriMonths[hm - 1]} ${hy} H`,
      gregorian: d.toISOString()
    };
  }

  /**
   * Convert Hijri date to Gregorian
   * @param day Day of month (1-30)
   * @param month Month number (1-12)
   * @param year Hijri year
   */
  fromHijri(day: number, month: number, year: number): Date {
    // Implementasi manual karena library tidak menyediakan fromHijri
    // Ini adalah pendekatan sederhana, mungkin perlu disesuaikan
    const approxDays = year * 354 + (month - 1) * 29.5 + day;
    const gregorianDate = new Date(622, 6, 16); // Tahun Hijriah dimulai
    gregorianDate.setDate(gregorianDate.getDate() + Math.round(approxDays));
    return gregorianDate;
  }

  /**
   * Parse Hijri date string to Gregorian
   * @param hijriString Format: 'DD MonthName YYYY'
   */
  parseHijri(hijriString: string): Date {
    const cleaned = hijriString
      .replace(/[hH,]/g, '')
      .trim()
      .split(/\s+/);

    if (cleaned.length !== 3) {
      throw new Error('Invalid format. Use: "DD MonthName YYYY"');
    }

    const day = parseInt(cleaned[0]);
    const monthName = cleaned[1].toLowerCase();
    const year = parseInt(cleaned[2]);

    const monthIndex = this.hijriMonths
      .map(m => m.toLowerCase())
      .findIndex(m => m.includes(monthName));

    if (monthIndex === -1) {
      throw new Error(`Invalid month. Valid: ${this.hijriMonths.join(', ')}`);
    }

    return this.fromHijri(day, monthIndex + 1, year);
  }

  /**
   * Get current Hijri date
   */
  getCurrentHijri() {
    return this.toHijri(new Date());
  }

  /**
   * Validate Hijri date string
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
   * Format Hijri date
   * @param format Pattern with DD, MM, MMM, YYYY
   */
  formatHijri(hijriString: string, format: string): string {
    const date = this.parseHijri(hijriString);
    const hijri = this.toHijri(date);

    return format
      .replace('DD', hijri.day.toString().padStart(2, '0'))
      .replace('MM', hijri.monthIndex.toString().padStart(2, '0'))
      .replace('MMM', hijri.month.substring(0, 3))
      .replace('YYYY', hijri.year.toString());
  }
}