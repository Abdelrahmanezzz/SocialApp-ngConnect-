import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FixedLayoutComponent } from '../../shared/fixed-layout/fixed-layout.component';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [FixedLayoutComponent, RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css',
})
export class AuthLayoutComponent {}
