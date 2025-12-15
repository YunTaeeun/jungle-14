"use client";

import Navigation from "@/components/Navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function PostDetailClient({ post }: { post: any }) {
    const router = useRouter();
    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const currentUser = JSON.parse(userStr);
            setIsAuthor(currentUser.id === post.author?.id);
        }

        // 조회수 증가 API 호출 (서버에서 IP 기반 중복 체크)
        fetch(`http://localhost:3000/posts/${post.id}/view`, {
            method: 'POST',
            credentials: 'include',
        }).catch(err => console.error('조회수 증가 실패:', err));

    }, [post.id, post.author?.id]);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3000/posts/${post.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error('삭제 실패');

            alert('삭제되었습니다');
            router.push('/');
        } catch (error) {
            console.error(error);
            alert('삭제에 실패했습니다');
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <article className="space-y-8">
                    <div className="space-y-6">
                        <h1 className="text-4xl text-gray-900">
                            {post.title}
                        </h1>

                        <div className="h-px bg-gray-200"></div>

                        <div className="text-base text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {post.content}
                        </div>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-500">
                            <span>{post.author?.nickname || post.author?.username || '알 수 없음'}</span>
                            <span className="mx-2">·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                            <span className="mx-2">·</span>
                            <span>조회 {post.viewCount || 0}</span>
                        </div>

                        {isAuthor && (
                            <div className="flex gap-4">
                                <Link
                                    href={`/post/${post.id}/edit`}
                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    수정
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="text-gray-600 hover:text-red-600 transition-colors"
                                >
                                    삭제
                                </button>
                            </div>
                        )}
                    </div>
                </article>
            </main>
        </div>
    );
}
