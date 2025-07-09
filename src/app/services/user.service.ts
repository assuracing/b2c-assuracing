// account.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  authorities: any;
  login: string;
  email: string;
  firstName: string;
  lastName: string;
  id: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {}

  getAccount(): Observable<User> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get<User>('http://localhost:8080/api/account', { headers }).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  private adherentIdSubject = new BehaviorSubject<number | null>(null);
  adherentId$ = this.adherentIdSubject.asObservable();

  getAdherentId() : Observable<number> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get<number>('http://localhost:8080/api/adherents/by-user/' + this.userSubject.value?.id, { headers }).pipe(
      tap(adherentId => this.adherentIdSubject.next(adherentId))
    );
  }

  getAdherentInfo() : Observable<User> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get<User>('http://localhost:8080/api/adherents/' + this.adherentIdSubject.value, { headers });
  }

  checkEmail(email: string, login: string): Observable<boolean> {
    return this.http.post<boolean>('http://localhost:8080/api/checkemail', { email, login });
  }

  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    if (!user || !user.authorities) return false;
    return user.authorities.includes(role);
  }

  getUser(): User | null {
    return this.userSubject.value;
  }

  getUserEmail(): string | null {
    const user = this.userSubject.value;
    return user ? user.email : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  sendVerificationEmail(email: string): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/sendVerificationCode', { email });
  }

  verifyCode(email: string, code: string): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/verifyCode', { email, code });
  }

  resetPassword(key: string, newPassword: string): Observable<void> {
    return this.http.post<void>('http://localhost:8080/api/account/reset-password/finish', { key, newPassword });
  }

  getAllContracts(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Authorization': `Bearer ${token}`
    };
    return this.http.get<any>('http://localhost:8080/api/getAllContrats', { headers });
  }

}
