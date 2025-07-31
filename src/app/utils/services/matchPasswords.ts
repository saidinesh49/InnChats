import { AbstractControl, ValidationErrors } from '@angular/forms';

export function matchPasswordValidator(
  control: AbstractControl
): ValidationErrors | null {
  const isPasswordMatching =
    control.get('password')?.value === control.get('confirmPassword')?.value;
  if (!isPasswordMatching) {
    return { passwordsMismatch: true };
  }
  return null;
}
