// home.component.ts
import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { HomeService } from './services/home.service';
import { Product, ProductInfo } from '../../models/home/home.model';
import { ThemeService } from '../../../shared/services/theme.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchService } from '../../shared/services/search.service';
import { UpdateRecommendationsService } from './services/update-recs.service';
import { HistoryService } from '../../shared/services/history.service';
import { ClickCountService } from '../../shared/services/click-count.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent implements OnInit {
  moviesList: Product[] = [];
  selected_elements: ProductInfo[] = [];
  numVisible: number = 4;
  isLoading = false;
  isEnd = false;

  responsiveOptions = [
    {
      breakpoint: '1199px',
      numVisible: 3,
      numScroll: 1
    },
    {
      breakpoint: '991px',
      numVisible: 2,
      numScroll: 1
    },
    {
      breakpoint: '767px',
      numVisible: 1,
      numScroll: 1
    }
  ];
  user_key = '';
  searchTerm: string = '';
  initialLoadComplete: boolean = false;

  constructor(private _clickCountService: ClickCountService, private _cdr: ChangeDetectorRef, private _historyService: HistoryService, private _updateRecommendationsService: UpdateRecommendationsService, private _productService: HomeService, private _searchService: SearchService, private _snackBar: MatSnackBar, private _themeService: ThemeService) {
    this.user_key = this.setUserKey()

  }

  ngOnInit() {
    this.updateNumVisible();

    this._updateRecommendationsService.updateRecommendations$.subscribe(() => {
      this.searchTerm = '';
      this._productService.getMoviesData(this.user_key, this.searchTerm, this.selected_elements).subscribe({
        next: (response) => {
          if (response) {
            this.moviesList = response
            this.openSnackBar("Рекомендации обновлены", "Закрыть");
          } else {
            this.openSnackBar('Произошла ошибка при загрузке данных.', "Закрыть");
          }
        },
        error: (err) => {
          const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке данных.";
          this.openSnackBar(errorMessage, "Закрыть");
        }
      });
    });

    this._searchService.currentSearchTerm.subscribe(term => {
      this.searchTerm = term;
      if (this.initialLoadComplete) {
        this.getMoviesData(this.user_key, term, this.selected_elements);
      }
    });

    this._clickCountService.clicksCount$.subscribe(count => {
      this.isEnd = count >= 20;
    });

    this._historyService.historyReset$.subscribe(() => {
      this.searchTerm = '';
      this.selected_elements = [];
      this.getMoviesData(this.user_key);
    });

    this.initialLoadComplete = true;


    this.getMoviesData(this.user_key);
  }

  setUserKey(): string {
    let userKey = localStorage.getItem('userKey');
    if (!userKey) {
      // Генерация уникального ключа 
      const uniqueKey = this.generateUUID();
      localStorage.setItem('userKey', uniqueKey);
      userKey = uniqueKey; // Assign uniqueKey to userKey if it was generated
    }
    return userKey; // Ensure a string is always returned.
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.updateNumVisible(); // Обновление видимых элементов при изменении размера 
  }

  getMoviesData(user_key: string, search?: string, selected_elements?: ProductInfo[]) {
    this.isLoading = true;
    this._productService.getMoviesData(user_key, search, selected_elements).subscribe({
      next: (response) => {
        if (response) {
          this.moviesList = response;
          const clicksCount = response[0]?.clicks_count || 0; // Если response[0] существует, берем clicks_count, иначе 0
          this._clickCountService.setClickCount(clicksCount);

          this.isLoading = false;
          this._cdr.detectChanges();
        } else {
          this.openSnackBar('Произошла ошибка при загрузке данных.', "Закрыть");
          this.isLoading = false;
          this._cdr.detectChanges();
        }

      },
      error: (err) => {
        const errorMessage = err.error && err.error.detail ? err.error.detail : "Произошла ошибка при загрузке данных.";
        this.openSnackBar(errorMessage, "Закрыть");
        this.isLoading = false;
        this._cdr.detectChanges();

      }
    });
  }

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 3000, verticalPosition: 'top',
      horizontalPosition: 'left'
    });
  }

  isDarkTheme(): boolean {
    return this._themeService.theme === 'dark';
  }


  updateNumVisible() {
    const windowWidth = window.innerWidth;

    // Логика для определения количества видимых элементов:
    if (windowWidth <= 800) {
      this.numVisible = 1;
    } else if (windowWidth <= 1100) {
      this.numVisible = 2;
    } else if (windowWidth <= 1400) {
      this.numVisible = 3;
    } else if (windowWidth <= 1700) {
      this.numVisible = 4;
    } else {
      this.numVisible = 5;
    }
  }

  onCheckboxChange(product: ProductInfo): void {
    if (product.selected) {
      product.selected = false;
      this._clickCountService.decrementClickCount(); // Уменьшаем количество кликов
    } else {
      product.selected = true;
      this._clickCountService.incrementClickCount(); // Увеличиваем количество кликов
    }

    // Обновление состояния liked и disliked
    if (!product.selected && product.liked) {
      product.liked = false;
    }

    if (!product.selected && product.disliked) {
      product.disliked = false;
    }
    this.updateSelectedElements();
  }

  onLike(product: ProductInfo): void {
    product.selected = true;
    product.liked = !product.liked;

    // Если пользователь лайкает элемент, увеличиваем количество кликов
    if (product.liked) {
      this._clickCountService.incrementClickCount();
      product.disliked = false; // Сбрасываем dislike при лайке
    } else {
      this._clickCountService.decrementClickCount(); // Уменьшаем количество кликов, если лайк снимается
    }

    this.updateSelectedElements();
  }

  onDislike(product: ProductInfo): void {
    product.selected = true;
    product.disliked = !product.disliked;

    // Если пользователь дизлайкает элемент, увеличиваем количество кликов
    if (product.disliked) {
      this._clickCountService.incrementClickCount();
      product.liked = false; // Сбрасываем like при дизлайке
    } else {
      this._clickCountService.decrementClickCount(); // Уменьшаем количество кликов, если дизлайк снимается
    }

    this.updateSelectedElements();
  }

  updateSelectedElements() {
    this.selected_elements = this.moviesList
      .flatMap(movie => movie.info) // Извлекаем массивы ProductInfo из каждого Product
      .filter(info => info.selected) // Фильтруем по выбранным элементам
      .map(info => ({
        title: info.title,
        description: info.description,
        video_id: info.video_id,
        image: info.image,
        category: info.category,
        public_date: info.public_date,
        liked: info.liked,
        disliked: info.disliked,
        selected: info.selected
      }));
  }


  getLikeImage(product: ProductInfo): string {
    if (product.liked) {
      return './../../assets/img/video/like-blue.svg'
    } else {
      return this.isDarkTheme() ? '../../../assets/img/video/like-dark.svg' : '../../../assets/img/video/like-light.svg';
    }
  }

  getDislikeImage(product: ProductInfo): string {
    if (product.disliked) {
      return './../../assets/img/video/like-blue.svg'
    } else {
      return this.isDarkTheme() ? '../../../assets/img/video/like-dark.svg' : '../../../assets/img/video/like-light.svg';
    }
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