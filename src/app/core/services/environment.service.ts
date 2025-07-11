import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  get apiUrl(): string {
    return environment.apiUrl;
  }

  get appUrl(): string {
    return environment.appUrl;
  }

  get isProduction(): boolean {
    return environment.production;
  }
}
