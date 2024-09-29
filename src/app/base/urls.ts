import { environment } from "../../environments/environment";
const api = environment.api;
export const URLs = {
    movies: {
        movies: api + 'movies',
        history: api + 'history',
        llm_predict: api + 'llm_predict',
        export_user_history: api + 'export_user_history'
    }
}
