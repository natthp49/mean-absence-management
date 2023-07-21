import { ValidatorFn } from '@angular/forms';

export const confirmPasswordValidator: ValidatorFn = (control) => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  return password && confirmPassword && password.value === confirmPassword.value
    ? null
    : { confirmPasswordInvalid: true };
};
