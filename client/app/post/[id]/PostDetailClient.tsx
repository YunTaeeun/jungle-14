"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CommentSection from '@/components/CommentSection';
import DOMPurify from 'dompurify';
import Navigation from "@/components/Navigation"; // Added back Navigation import

interface Post {
    id: number;
    title: string;
    content: string;
    author?: {
        id: number;
        username: string;
        nickname?: string;
    };
    viewCount: number;
    createdAt: string;
}

export default function PostDetailClient({ post }: { post: Post }) {
    const router = useRouter();
    const [viewCount, setViewCount] = useState(post.viewCount);
    const hasIncrementedView = useRef(false);

    useEffect(() => {
        // const currentUserId = JSON.parse(localStorage.getItem('user') || '{}').id; // This line was removed in the original diff, but the logic for isAuthor was moved outside useEffect.

        if (!hasIncrementedView.current) {
            hasIncrementedView.current = true;
            fetch(`http://localhost:3000/posts/${post.id}/view`, {
                method: 'POST',
                credentials: 'include',
            })
                .then(res => res.json())
                .then(data => {
                    // 서버가 조회수를 증가시켰을 때만 프론트엔드도 증가
                    if (data.success) {
                        setViewCount((prev: number) => prev + 1);
                    }
                })
                .catch(err => console.error('조회수 증가 실패:', err));
        }
    }, [post.id]); // post.author?.id 제거

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('token');
        const res = await fetch(`http://localhost:3000/posts/${post.id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            alert('게시물이 삭제되었습니다.');
            router.push('/');
        }
    };

    const currentUserId = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('user') || '{}').id
        : null;
    const isAuthor = currentUserId === post.author?.id;

    return (
        <div className="min-h-screen bg-white">
            <Navigation /> {/* Added back Navigation component */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <article className="space-y-8"> {/* Added back space-y-8 to article */}
                    <div className="space-y-6">
                        <h1 className="text-4xl text-gray-900">
                            {post.title}
                        </h1>

                        <div className="h-px bg-gray-200"></div>

                        <div
                            className="text-base text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(post.content, {
                                    ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'span', 'div'],
                                    ALLOWED_ATTR: ['style'],
                                })
                            }}
                        />
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    <div className="flex justify-between items-center text-sm">
                        <div className="text-gray-500">
                            <span>{post.author?.nickname || post.author?.username || '알 수 없음'}</span>
                            <span className="mx-2">·</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                            <span className="mx-2">·</span>
                            <span>조회 {viewCount || 0}</span>
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

                    {/* 댓글 섹션 */}
                    <CommentSection postId={post.id} />
                </article>
            </main>
        </div>
    );
}
