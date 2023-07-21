import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaveForm, Leave } from './leave.model';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  constructor(private http: HttpClient) {}

  getLeaveList() {
    return this.http.get<Leave[]>('/leaves');
  }

  getLeave(id: string) {
    return this.http.get<Leave>(`/leaves/${id}`);
  }

  create(form: LeaveForm) {
    return this.http.post<Leave>('/leaves', form);
  }

  update(id: string, form: LeaveForm) {
    return this.http.patch<Leave>(`/leaves/${id}`, form);
  }

  remove(id: string) {
    return this.http.delete(`/leaves/${id}`);
  }
}
