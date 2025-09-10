import { HttpHeaders } from '@angular/common/http';

export function getAuthHeaders(): { headers: HttpHeaders, withCredentials: boolean } {
  const token = localStorage.getItem('auth_token');
  const csrfToken = getCookie('XSRF-TOKEN');
  
  let headers: { [key: string]: string } = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  return { 
    headers: new HttpHeaders(headers),
    withCredentials: true
  };
}

export function setAuthToken(token: string): void {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}
