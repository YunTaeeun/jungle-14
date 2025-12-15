'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Post {
    id: number;
    title: string;
    content: string;
    author: {
        username: string;
        nickname?: string;
    };
    viewCount: number;
    createdAt: string;
}

export default function InfiniteScrollPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchPosts = useCallback(async (pageNum: number) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/posts?page=${pageNum}&limit=10`);
            if (res.ok) {
                const data = await res.json();

                if (data.data.length === 0) {
                    setHasMore(false);
                } else {
                    setPosts(prev => pageNum === 1 ? data.data : [...prev, ...data.data]);
                    setHasMore(data.page < data.totalPages);
                }
            }
        } catch (error) {
            console.error('게시물 로드 실패:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // 초기 로드
    useEffect(() => {
        fetchPosts(1);
    }, [fetchPosts]);

    // Intersection Observer 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 1.0 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loading]);

    // 페이지 변경 시 데이터 로드 (첫 페이지 제외)
    useEffect(() => {
        if (page > 1) {
            fetchPosts(page);
        }
    }, [page, fetchPosts]);

    return (
        <div className="space-y-6">
            {/* 게시물 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/post/${post.id}`}
                        className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                        <h2 className="text-xl font-semibold mb-2 line-clamp-2">{post.title}</h2>
                        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
                        <div className="text-sm text-gray-500 space-y-1">
                            <div>{post.author.nickname || post.author.username}</div>
                            <div className="flex justify-between">
                                <span>{new Date(post.createdAt).toLocaleDateString('ko-KR')}</span>
                                <span>조회 {post.viewCount}</span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* 로딩 스피너 */}
            {loading && (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Intersection Observer 타겟 */}
            <div ref={observerTarget} className="h-20" />

            {/* 더 이상 게시물이 없을 때 */}
            {!hasMore && posts.length > 0 && (
                <p className="text-center text-gray-500 py-8">모든 게시물을 불러왔습니다.</p>
            )}

            {/* 게시물이 하나도 없을 때 */}
            {!loading && posts.length === 0 && (
                <p className="text-center text-gray-500 py-12">게시물이 없습니다.</p>
            )}
        </div>
    );
}
