import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FlashMessage } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FlashMessageService {
  private _flashMessage$ = new BehaviorSubject<FlashMessage | null>(null);

  constructor() {}

  get flashMessage$() {
    return this._flashMessage$.asObservable();
  }

  setFlashMessage(flashMessage: FlashMessage) {
    this._flashMessage$.next(flashMessage);
  }

  clear() {
    this._flashMessage$.next(null);
  }
}
