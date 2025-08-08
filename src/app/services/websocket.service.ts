import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  socket: any;
  readonly uri: string = 'ws://localhost:8000';
  constructor() {
    this.socket = io(this.uri);
  }

  listen(eventName: string) {
    return new Observable((subscriber) => {
      this.socket.on(eventName, (data: any) => {
        console.log('received data at service is:', data);
        subscriber.next(data);
      });
    });
  }

  emit(eventName: string, data: any) {
    console.log('emitting data from service is:', data);
    this.socket.emit(eventName, data);
  }
}
