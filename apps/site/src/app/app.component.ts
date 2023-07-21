import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@mean-absence-management/auth';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  standalone: true,
  imports: [RouterModule],
  selector: 'mean-absence-management-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  private refresh$ = inject(AuthService).refresh();

  constructor() {
    this.refresh$.pipe(takeUntilDestroyed()).subscribe();
  }
}
