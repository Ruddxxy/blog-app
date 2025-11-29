export interface Post {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_image_url: string | null;
    created_at: string;
    is_published: boolean;
}
