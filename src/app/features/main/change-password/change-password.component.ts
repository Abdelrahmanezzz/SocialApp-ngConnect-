import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ChangePasswordRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private authService = inject(AuthService);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showRePassword = signal(false);
  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  confirmPassword = (control: AbstractControl): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const rePassword = control.get('rePassword')?.value;

    if (!newPassword || !rePassword) {
      return null;
    }

    return newPassword === rePassword ? null : { passwordMismatch: true };
  };

  passwordForm: FormGroup = new FormGroup(
    {
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
      ]),
      rePassword: new FormControl('', [Validators.required]),
    },
    { validators: this.confirmPassword },
  );

  onSubmit() {
    if (this.passwordForm.valid) {
      this.isLoading.set(true);
      this.successMessage.set(null);
      this.errorMessage.set(null);

      const data: ChangePasswordRequest = {
        currentPassword: this.passwordForm.value.currentPassword,
        newPassword: this.passwordForm.value.newPassword,
        rePassword: this.passwordForm.value.rePassword,
      };

      this.authService
        .changePassword(data)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.successMessage.set('Password updated successfully.');
            this.passwordForm.reset();
          },
          error: (err) => {
            this.errorMessage.set(
              err.error?.message || 'Failed to update password. Please try again.',
            );
          },
        });
    } else {
      this.passwordForm.markAllAsTouched();
    }
  }

  togglePassword(field: string) {
    switch (field) {
      case 'current':
        this.showCurrentPassword.update((prev) => !prev);
        break;
      case 'new':
        this.showNewPassword.update((prev) => !prev);
        break;
      case 're':
        this.showRePassword.update((prev) => !prev);
        break;
    }
  }
}
