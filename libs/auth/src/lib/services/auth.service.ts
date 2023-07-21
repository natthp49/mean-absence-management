import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  LoginForm,
  Profile,
  ProfileForm,
  RegisterForm,
  TokensWithProfile,
} from '../auth.model';
import { BehaviorSubject, of, switchMap, tap } from 'rxjs';
import { FlashMessageService } from '@mean-absence-management/ui';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private flashMessageService = inject(FlashMessageService);
  private _accessToken$ = new BehaviorSubject<string | null>(null);
  private _refreshToken$ = new BehaviorSubject<string | null>(null);
  private _profile$ = new BehaviorSubject<Profile | null>(null);

  get accessToken$() {
    return this._accessToken$.asObservable();
  }

  get refreshToken$() {
    return this._refreshToken$.asObservable();
  }

  get profile$() {
    return this._profile$.asObservable();
  }

  get accessToken() {
    return localStorage.getItem('accessToken');
  }

  get refreshToken() {
    return localStorage.getItem('refreshToken');
  }

  get isLoggedIn() {
    return Boolean(this.accessToken);
  }

  register(form: RegisterForm) {
    return this.http.post<Profile>('/auth/sign-up', form);
  }

  login(form: LoginForm) {
    return this.http.post<TokensWithProfile>('/auth/sign-in', form).pipe(
      tap(({ accessToken, refreshToken, user }) => {
        this._accessToken$.next(accessToken);
        this._refreshToken$.next(refreshToken);
        this._profile$.next(user);
        this.storeTokens(accessToken, refreshToken);
        this.flashMessageService.setFlashMessage({
          message: 'Welcome back!',
        });
      })
    );
  }

  logout() {
    this._accessToken$.next(null);
    this._refreshToken$.next(null);
    this._profile$.next(null);
    this.clearTokens();
  }

  refresh() {
    return of(this.refreshToken).pipe(
      switchMap((token) => {
        if (!token) return of(null);

        return this.http
          .post<TokensWithProfile>('/auth/refresh-token', {
            refreshToken: this.refreshToken,
          })
          .pipe(
            tap(({ accessToken, refreshToken, user }) => {
              this._accessToken$.next(accessToken);
              this._refreshToken$.next(refreshToken);
              this._profile$.next(user);
              this.storeTokens(accessToken, refreshToken);
            })
          );
      })
    );
  }

  editProfile(form: ProfileForm) {
    const formData = new FormData();

    for (const [key, value] of Object.entries(form)) {
      if (value) formData.append(key, value);
    }

    return this.http
      .patch<Profile>('/auth/profile', formData)
      .pipe(tap((profile) => this._profile$.next(profile)));
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  private clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
