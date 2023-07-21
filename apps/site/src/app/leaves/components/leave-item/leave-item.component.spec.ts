import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaveItemComponent } from './leave-item.component';

describe('LeaveItemComponent', () => {
  let component: LeaveItemComponent;
  let fixture: ComponentFixture<LeaveItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeaveItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
