import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

interface LoginResponse {
  id_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private tokenKey = 'auth_token';

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem(this.tokenKey);
    this.isAuthenticatedSubject.next(!!token);
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('http://localhost:8080/api/authenticate', { username, password }).pipe(
      tap((res) => {
        console.log('Login successful, token:', res.id_token);
        console.log('is login ?:', this.isLoggedIn());
        localStorage.setItem(this.tokenKey, res.id_token);
        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isLoggedOut(): boolean {
    return !this.isLoggedIn();
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post('http://localhost:8080/api/reset-password/init', { email });
  }

  resetPasswordInit(email: string): Observable<void> {
  return this.http.post<void>('http://localhost:8080/api/account/reset-password/init', email, {
    headers: { 'Content-Type': 'text/plain' }
  });
}
  resetPasswordFinish(key: string, newPassword: string): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/account/reset-password/finish', {
      key,
      newPassword
    });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/account/change-password', {
      currentPassword,
      newPassword
    });
  }
}
