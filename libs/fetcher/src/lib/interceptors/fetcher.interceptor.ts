import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@mean-absence-management/auth';
import { FlashMessageService } from '@mean-absence-management/ui';
import { catchError, switchMap, throwError } from 'rxjs';

const getBaseRequest = (
  authService: AuthService,
  req: HttpRequest<unknown>
) => {
  const token = authService.accessToken;

  return req.clone({
    url: `${import.meta.env.NG_APP_API_URL}${req.url}`,
    setHeaders: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });
};

export const fetcherInterceptor = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const flashMessageService = inject(FlashMessageService);

  return next(getBaseRequest(authService, req)).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        if (error.url?.endsWith('/auth/refresh-token')) {
          authService.logout();
          flashMessageService.setFlashMessage({
            message: 'Your session has expired, please login',
          });
          router.navigateByUrl('/auth/login');

          return throwError(() => error);
        } else {
          return authService
            .refresh()
            .pipe(switchMap(() => next(getBaseRequest(authService, req))));
        }
      }

      return throwError(() => error);
    })
  );
};
