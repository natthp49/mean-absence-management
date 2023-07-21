import { Component, OnInit, inject } from '@angular/core';
import { NgIf, TitleCasePipe } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services';

@Component({
  selector: 'mean-absence-management-profile',
  standalone: true,
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    RouterModule,
    NgIf,
    TitleCasePipe,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  form = this.fb.nonNullable.group({
    name: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    avatar: new FormControl<File | null>(null, [Validators.required]),
  });
  avatarPreview = '/assets/images/avatar.png';

  ngOnInit() {
    this.authService.profile$.subscribe((profile) => {
      if (!profile) return;

      if (profile.avatar) {
        this.avatarPreview = `http://localhost:3333/${profile.avatar}`;
      }
      this.form.patchValue({ name: profile.name });
    });
  }

  changeAvatar(event: Event) {
    const files = (event.target as HTMLInputElement).files;

    if (!files?.length) return;

    const avatar = files[0];
    this.avatarPreview = URL.createObjectURL(avatar);
    this.form.patchValue({ avatar });
  }

  editProfile() {
    const form = this.form.getRawValue();

    this.authService
      .editProfile(form)
      .subscribe(() => this.router.navigateByUrl('/'));
  }
}
