export interface User {
    id: number;
    username: string;
    email: string;
    password?: string;
    nickname?: string;
    createdAt: Date | string;
}

export interface Post {
    id: number;
    title: string;
    content: string;
    author: User;
    createdAt: Date | string;
    updatedAt: Date | string;
    viewCount: number;
}

export interface LoginResponse {
    access_token: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
}
