import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URLs } from '../../../../base/urls';

@Injectable({
    providedIn: 'root'
})
export class AskLLMDialogService {
    constructor(private _httpClient: HttpClient) { }

    askLLMDialog(search: string | null, user_key: string | null) {
        return this._httpClient.post<{predict: string}>(URLs.movies.llm_predict, { search: search, user_key: user_key });
    }
}

