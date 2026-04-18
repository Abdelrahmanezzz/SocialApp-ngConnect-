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
import { SigninRequest } from '../../../core/models/auth.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  emailOrUsernameValidator = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    if (value.includes('@')) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailPattern.test(value) ? null : { invalidEmail: true };
    }

    const usernamePattern = /^[a-z0-9_]+$/;
    return usernamePattern.test(value) ? null : { invalidUsername: true };
  };

  loginForm: FormGroup = new FormGroup({
    emailOrUsername: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
      this.emailOrUsernameValidator,
    ]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  onSubmitLogin() {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const loginData: SigninRequest = {
        emailOrUsername: this.loginForm.value.emailOrUsername,
        password: this.loginForm.value.password,
      };

      this.authService
        .signin(loginData)
        .pipe(finalize(() => this.isLoading.set(false)))
        .subscribe({
          next: () => {
            this.router.navigate(['/main/feed']);
          },
          error: (err) => {
            this.errorMessage.set(
              err.error?.message || 'Login failed. Please check your credentials.',
            );
          },
        });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  togglePassword() {
    this.showPassword.update((prev) => !prev);
  }
}
