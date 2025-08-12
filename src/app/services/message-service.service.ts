import { Injectable } from '@angular/core';
import { Message } from '../Interfaces/message.interface';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth-service.service';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  readonly apiUrl: string = 'https://innchats.onrender.com';
  messages!: Message[];

  constructor(private authService: AuthService, private http: HttpClient) {}

  loadMessages(
    chatId: string,
    beforeMessageId?: string | null,
    limit: number = 15
  ) {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http.post<{ data: any }>(
      `${this.apiUrl}/message/load-messages`,
      {
        roomId: chatId,
        beforeMessageId: beforeMessageId || null,
        limit,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }

  storeMessage(chatId: string, senderId: string, message: string) {
    const accessToken = this.authService.getCookie('accessToken');
    return this.http.post<{ data: any }>(
      `${this.apiUrl}/message/store-message`,
      {
        roomId: chatId,
        senderId: senderId,
        message: message,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
  }
}
