export interface Product {
    header_title: string;
    info: ProductInfo[];
    clicks_count: number;
}

export interface ProductInfo {
    title: string;
    description?: string;
    image?: string | null;
    liked?: boolean;
    disliked?: boolean;
    selected?: boolean;
    category?: string;
    public_date?: string;
    video_id?: string;
}
