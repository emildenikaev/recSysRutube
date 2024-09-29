import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UpdateRecommendationsService {
  private updateRecommendationsSubject = new Subject<void>();

  updateRecommendations$ = this.updateRecommendationsSubject.asObservable();

  triggerUpdateRecommendations() {
    this.updateRecommendationsSubject.next();
  }
}