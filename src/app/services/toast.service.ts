import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastPosition = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  position?: ToastPosition;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastSubject = new BehaviorSubject<ToastMessage | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(
    message: string, 
    type: 'success' | 'error' | 'info' | 'warning' = 'info', 
    duration: number = 2500,
    position: ToastPosition = 'top-center'
  ) {
    this.toastSubject.next({ message, type, duration, position });
  }

  success(message: string, duration: number = 2500, position?: ToastPosition) {
    this.show(message, 'success', duration, position);
  }

  error(message: string, duration: number = 2500, position?: ToastPosition) {
    this.show(message, 'error', duration, position);
  }

  info(message: string, duration: number = 2500, position?: ToastPosition) {
    this.show(message, 'info', duration, position);
  }

  warning(message: string, duration: number = 2500, position?: ToastPosition) {
    this.show(message, 'warning', duration, position);
  }

  clear() {
    this.toastSubject.next(null);
  }
}
