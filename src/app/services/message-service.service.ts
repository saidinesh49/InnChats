import { Injectable } from '@angular/core';
import { Message } from '../Interfaces/message.interface';

@Injectable({
  providedIn: 'root',
})
export class MessageServiceService {
  messages!: Message[];
  constructor() {}
}
