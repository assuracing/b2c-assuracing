import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-payment-confirm',
  template: `
    <div class="payment-container">
      <iframe [src]="frameUrl" class="payment-iframe"></iframe>
    </div>
  `,
  styles: [`
    .payment-container {
      width: 100%;
      height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
    }

    .payment-iframe {
      width: 80%;
      max-width: 1000px;
      height: 80vh;
      border: none;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
  `]
})
export class PaymentConfirmComponent implements OnInit {
  frameUrl: SafeResourceUrl = '';

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const orderid = params['orderid'];
      const email = params['email'];
      const language = params['language'];

      const rawUrl = `http://localhost:8080/paymentconfirm?orderid=${orderid}&email=${email}&language=${language}`;
      this.frameUrl = this.sanitizer.bypassSecurityTrustResourceUrl(rawUrl);
    });
  }
}
