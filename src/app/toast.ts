import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="currentToast" 
         [ngClass]="['toast', currentToast.type, currentToast.position || 'top-center']">
      {{ currentToast.message }}
    </div>
  `,
  styles: [`
    .toast {
      position: fixed;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: #fff;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 80%;
      text-align: center;
    }
    
    .toast.top-left {
      top: 20px;
      left: 20px;
    }
    
    .toast.top-center {
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .toast.top-right {
      top: 20px;
      right: 20px;
    }
    
    .toast.bottom-left {
      bottom: 20px;
      left: 20px;
    }
    
    .toast.bottom-center {
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    .toast.bottom-right {
      bottom: 20px;
      right: 20px;
    }

    .success { background-color: #4caf50; }
    .error { background-color: #f44336; }
    .info { background-color: #2196f3; }
    .warning { background-color: #ff9800; }

    @keyframes fadein {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes fadeout {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(20px); }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  currentToast: ToastMessage | null = null;
  private toastSubscription: Subscription | null = null;
  private timeoutId: any = null;

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    this.toastSubscription = this.toastService.toast$.subscribe(toast => {
      this.currentToast = toast;
      
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }

      if (toast) {
        this.timeoutId = setTimeout(() => {
          this.currentToast = null;
        }, toast.duration || 2500);
      }
    });
  }

  ngOnDestroy() {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
