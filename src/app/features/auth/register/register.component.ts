import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
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
import { SignupRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  showRePassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  confirmPassword = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const rePassword = control.get('rePassword')?.value;

    if (!password || !rePassword) {
      return null;
    }

    return password === rePassword ? null : { passwordMismatch: true };
  };

  registerForm: FormGroup = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(30),
        Validators.pattern(/^[a-z0-9_]+$/),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      dateOfBirth: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).+$/),
      ]),
      rePassword: new FormControl('', [Validators.required]),
    },
    { validators: this.confirmPassword },
  );

  onSubmitRegister() {
    if (this.registerForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const registerData: SignupRequest = {
        name: this.registerForm.value.name,
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        dateOfBirth: this.registerForm.value.dateOfBirth,
        gender: this.registerForm.value.gender,
        password: this.registerForm.value.password,
        rePassword: this.registerForm.value.rePassword,
      };

      this.authService
        .signup(registerData)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
          },
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  togglePassword(field: string) {
    if (field === 'password') {
      this.showPassword.update((prev) => !prev);
    } else if (field === 'rePassword') {
      this.showRePassword.update((prev) => !prev);
    }
  }
}
