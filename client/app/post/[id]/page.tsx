'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostDetailClient from "./PostDetailClient";

export default function PostPage() {
    const params = useParams();
    const id = params?.id as string;
    const [post, setPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const res = await fetch(`http://localhost:3000/posts/${id}`);

                if (!res.ok) {
                    throw new Error('Failed to fetch post');
                }

                const data = await res.json();
                setPost(data);
            } catch (error) {
                console.error('Error fetching post:', error);
                setPost(null);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-center text-gray-500">로딩 중...</p>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-center text-gray-500">게시물을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return <PostDetailClient post={post} />;
}
