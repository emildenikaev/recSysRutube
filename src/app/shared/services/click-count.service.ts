import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ClickCountService {
  private clicksCountSubject = new BehaviorSubject<number>(0); // Начальное значение 0
  clicksCount$ = this.clicksCountSubject.asObservable();

  setClickCount(count: number) {
    this.clicksCountSubject.next(count);
  }

  incrementClickCount() {
    const currentCount = this.clicksCountSubject.value;
    this.clicksCountSubject.next(currentCount + 1);
  }

  decrementClickCount() {
    const currentCount = this.clicksCountSubject.value;
    this.clicksCountSubject.next(currentCount > 0 ? currentCount - 1 : 0);
  }
}