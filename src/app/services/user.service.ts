import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, switchMap, map, catchError } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { EnvironmentService } from '../core/services/environment.service';
import { getAuthHeaders, setAuthToken, getAuthToken } from '../core/utils/http-utils';

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

  private apiUrl: string;

  constructor(
    private http: HttpClient,
    private envService: EnvironmentService
  ) {
    this.apiUrl = this.envService.apiUrl;
  }


  getAccount(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/api/account`, getAuthHeaders()).pipe(
      tap(user => this.userSubject.next(user))
    );
  }

  private adherentIdSubject = new BehaviorSubject<number | null>(null);
  adherentId$ = this.adherentIdSubject.asObservable();

  getAdherentId(): Observable<number> {
    return this.http.get<any>(
      `${this.apiUrl}/api/adherents/by-user/${this.userSubject.value?.id}`, 
      getAuthHeaders()
    ).pipe(
      tap(adherent => this.adherentIdSubject.next(adherent.id)),
      map((adherent: any) => adherent.id)
    );
  }

  getAdherentInfo(): Observable<any> {
    const adherentId = this.adherentIdSubject.value;
    
    const getUserInfo = () => this.getAccount().pipe(
      map(user => ({
        id: user.id,
        nom: user.lastName || '',
        prenom: user.firstName || '',
        email: user.email || '',
        isBasicInfo: true
      }))
    );

    const getAdherentInfo = (id: number) => this.http.get<any>(
      `${this.apiUrl}/api/adherents/${id}`, 
      getAuthHeaders()
    ).pipe(
      catchError(error => {
        if (error.status === 404) {
          return getUserInfo();
        }
        return throwError(error);
      })
    );

    if (adherentId) {
      return getAdherentInfo(adherentId);
    }

    return this.getAdherentId().pipe(
      switchMap(id => getAdherentInfo(id)),
      catchError(error => {
        if (error.status === 404) {
          return getUserInfo();
        }
        return throwError(error);
      })
    );
  }

  checkEmail(email: string, login: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.apiUrl}/api/checkemail`, 
      { email, login },
      getAuthHeaders()
    );
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
    return getAuthToken();
  }

  setToken(token: string): void {
    setAuthToken(token);
  }

  sendVerificationEmail(email: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/api/sendVerificationCode`, 
      { email },
      getAuthHeaders()
    );
  }

  verifyCode(email: string, code: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/api/verifyCode`, 
      { email, code },
      getAuthHeaders()
    );
  }

  resetPassword(key: string, newPassword: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/api/account/reset-password/finish`, 
      { key, newPassword },
      getAuthHeaders()
    );
  }

  getAllContracts(): Observable<any> {
    return this.http.get<any>(
      `${this.apiUrl}/api/getAllContrats`,
      getAuthHeaders()
    );
  }

  updateUserProfile(profileData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/account`, 
      profileData, 
      getAuthHeaders()
    );
  }
}
