import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HistoryService {
    private historyResetSubject = new Subject<void>();
    historyReset$ = this.historyResetSubject.asObservable();

    emitHistoryReset() {
        this.historyResetSubject.next();
    }
}