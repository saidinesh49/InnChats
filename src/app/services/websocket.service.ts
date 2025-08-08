import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  socket: any;
  readonly uri: string = 'https://innchats-backend.vercel.app';
  constructor() {
    this.socket = io(this.uri, {
      transports: ['websocket'], // 🔐 force WebSocket protocol
      // withCredentials: true,
    });
  }

  register(userId: string) {
    this.socket.emit('register', userId);
  }

  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }
}
