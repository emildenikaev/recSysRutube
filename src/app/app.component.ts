import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { ThemeService } from '../shared/services/theme.service';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeModule } from './pages/home/home.module';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ButtonModule } from 'primeng/button';
import { SearchService } from './shared/services/search.service';
import { HomeService } from './pages/home/services/home.service';
import { UpdateRecommendationsService } from './pages/home/services/update-recs.service';
import { HistoryService } from './shared/services/history.service';
import { HttpClientModule } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { AskLLMDialogComponent } from './shared/components/home/ask-llm-dialog.component';
import { AskLLMDialogModule } from './shared/components/home/ask-llm-dialog.module';
import { ClickCountService } from './shared/services/click-count.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ButtonModule, FormsModule, MatSnackBarModule, ReactiveFormsModule, AskLLMDialogModule, HomeModule, MatButtonModule,
    RouterOutlet, RouterModule, MatListModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  enabled = false;
  searchTerm = '';
  tooltipVisible = [false, false, false];
  tooltipText = ['', '', ''];
  clicksCount = 0;

  constructor(public dialog: MatDialog, private _clickCountService: ClickCountService, private _historyService: HistoryService, private _updateRecommendationsService: UpdateRecommendationsService, private _productService: HomeService, private _themeService: ThemeService, private _searchService: SearchService, private _snackBar: MatSnackBar) {
    this.setUserKey();

    const savedTheme = localStorage.getItem('theme');
    this.enabled = savedTheme === 'dark' || (savedTheme === null && this._themeService.theme === 'dark');

    document.body.classList.toggle('dark-mode', this.enabled);
    document.body.classList.toggle('light-mode', !this.enabled);

    this._clickCountService.clicksCount$.subscribe(count => {
      this.clicksCount = count;
    });

  }

  showTooltip(text: string, index: number) {
    this.tooltipText[index] = text;
    this.tooltipVisible[index] = true;
  }

  onSearch() {
    this._searchService.changeSearchTerm(this.searchTerm);
  }

  hideTooltip() {
    this.tooltipVisible.fill(false);
  }

  setUserKey() {
    const userKey = localStorage.getItem('userKey');
    if (!userKey) {
      const uniqueKey = this.generateUUID();
      localStorage.setItem('userKey', uniqueKey);
    }
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  changeTheme() {
    this.enabled = !this.enabled;
    this._themeService.theme = this.enabled ? 'dark' : 'default';
    localStorage.setItem('theme', this.enabled ? 'dark' : 'default');
    document.body.classList.toggle('dark-mode', this.enabled);
    document.body.classList.toggle('light-mode', !this.enabled);
  }

  resetRecs() {
    this.searchTerm = '';
    this._updateRecommendationsService.triggerUpdateRecommendations();
  }

  askLLM() {
    this.dialog.open(AskLLMDialogComponent, {
      width: '600px',
    });
  }

  exportUserHistory() {
    const userKey = localStorage.getItem('userKey');

    this._productService.exportUserHistory(userKey).subscribe({
      next: (response) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${userKey}_history.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при выгрузке данных.";
        this._snackBar.open(errorMessage, "Закрыть", {
          duration: 3000,
          verticalPosition: 'top',
          horizontalPosition: 'left'
        });
      }
    });
  }

  resetHistory() {
    const userKey = localStorage.getItem('userKey');
    this.searchTerm = '';

    this._productService.deleteHistory(userKey).subscribe({
      next: (response) => {
        if (response) {
          this._snackBar.open("История пользователя успешно сброшена.", "Закрыть", {
            duration: 3000,
            horizontalPosition: 'left',
            verticalPosition: 'top',
          });

          this._historyService.emitHistoryReset();
        }
      },
      error: (err) => {
        const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке данных.";
        this._snackBar.open(errorMessage, "Закрыть");
      }
    });
  }
}