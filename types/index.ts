export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image_url: string | null;
    created_at: string;
    is_published: boolean;
    user_id?: string;
    likes?: Like[];
    comments?: Comment[];
}

export interface Like {
    id: string;
    user_id: string;
    post_id: string;
    created_at: string;
}

export interface Comment {
    id: string;
    user_id: string;
    post_id: string;
    content: string;
    created_at: string;
}
