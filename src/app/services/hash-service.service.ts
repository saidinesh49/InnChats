import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root',
})
export class HashService {
  private secretKey: string = 'ThisCanAlsoBeAKey';

  constructor() {}

  encryptData(users: string[]): string {
    try {
      if (!(users[0] && users[1])) {
        throw new Error("Both userId's required to get chatId via encryption");
      }
      users.sort();
      let data = users[0] + '_' + users[1];
      const jsonData = JSON.stringify(data);
      const encryptedData = CryptoJS.AES.encrypt(
        jsonData,
        this.secretKey
      ).toString();
      return encryptedData;
    } catch (e) {
      console.error('Encryption error:', e);
      return '';
    }
  }

  decryptData(cipherText: string): string | null {
    try {
      const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey);
      const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedData);
    } catch (e) {
      console.log('Decryption error:', e);
      throw new Error(e as string);
    }
  }
}
