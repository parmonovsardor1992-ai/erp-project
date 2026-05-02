import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

@Injectable()
export class PasswordService {
  hash(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `scrypt:${salt}:${hash}`;
  }

  verify(password: string, storedHash: string): boolean {
    const [algorithm, salt, hash] = storedHash.split(':');
    if (algorithm !== 'scrypt' || !salt || !hash) {
      return false;
    }

    const calculated = scryptSync(password, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return calculated.length === expected.length && timingSafeEqual(calculated, expected);
  }
}
