import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { EnvironmentService } from '../core/services/environment.service';

interface LoginResponse {
  id_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenKey = 'authenticationToken';

  private apiUrl: string;

  constructor(
    private http: HttpClient, 
    private router: Router,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
    const token = this.getToken();
    this.isAuthenticatedSubject.next(!!token);
  }

  login(username: string, password: string, rememberMe: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/api/authenticate`, { username, password, rememberMe }).pipe(
      tap((res) => {
        this.storeToken(res.id_token, rememberMe);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  private storeToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.tokenKey, token);
      sessionStorage.removeItem(this.tokenKey);
    } else {
      sessionStorage.setItem(this.tokenKey, token);
      localStorage.removeItem(this.tokenKey);
    }
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  isLoggedOut(): boolean {
    return this.getToken() === null;
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/reset-password/init`, { email });
  }

  resetPasswordInit(email: string): Observable<void> {
  return this.http.post<void>(`${this.apiUrl}/api/account/reset-password/init`, email, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
  resetPasswordFinish(key: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/account/reset-password/finish`, {
      key,
      newPassword
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/api/account/change-password`, {
      currentPassword,
      newPassword
    });
  }
}
