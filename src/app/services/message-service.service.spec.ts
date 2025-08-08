import { TestBed } from '@angular/core/testing';

import { MessageService } from './message-service.service';

describe('MessageServiceService', () => {
  let service: MessageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
