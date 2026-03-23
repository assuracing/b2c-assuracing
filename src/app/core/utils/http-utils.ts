import { HttpHeaders } from '@angular/common/http';

export function getAuthHeaders(): { headers: HttpHeaders, withCredentials: boolean } {
  const token = localStorage.getItem('authenticationToken') || sessionStorage.getItem('authenticationToken');
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

export function setAuthToken(token: string, rememberMe: boolean = false): void {
  if (token) {
    if (rememberMe) {
      localStorage.setItem('authenticationToken', token);
      sessionStorage.removeItem('authenticationToken');
    } else {
      sessionStorage.setItem('authenticationToken', token);
      localStorage.removeItem('authenticationToken');
    }
  } else {
    localStorage.removeItem('authenticationToken');
    sessionStorage.removeItem('authenticationToken');
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem('authenticationToken') || sessionStorage.getItem('authenticationToken');
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}
