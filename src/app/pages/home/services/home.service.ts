import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../base/urls';
import { Product, ProductInfo } from '../../../models/home/home.model';

@Injectable({
    providedIn: 'root'
})
export class HomeService {
    constructor(private _httpClient: HttpClient) { }

    exportUserHistory(user_key: string | null) { 
        return this._httpClient.post(URLs.movies.export_user_history, { user_key: user_key }, { responseType: 'blob' });
      }
    

    getMoviesData(
        user_key?: string,
        search?: string,
        selected_elements?: ProductInfo[]
    ) {
        const payload: any = {};

        if (user_key) {
            payload.user_key = user_key;
        }

        if (search) {
            payload.search = search;
            
            // const wordCount = search.trim().split(/\s+/).length; 
            // if (wordCount >= 8) {
            //     payload.search_type = "transformer"; 
            // }    
        }

        if (user_key) {
            payload.user_key = user_key;
        }

        if (Array.isArray(selected_elements) && selected_elements.length > 0) {
            payload.selected_elements = selected_elements;
        }

        return this._httpClient.post<Product[]>(URLs.movies.movies, payload);
    }
    deleteHistory(user_key: string | null) {
        const body = { user_key };

        return this._httpClient.delete(URLs.movies.history, { body });
    }
}

