'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { ArrowLeft } from 'lucide-react';

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

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || '';
    const type = (searchParams.get('type') as 'title' | 'content' | 'author') || 'title';

    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(
                    `http://localhost:3000/posts/search?query=${encodeURIComponent(query)}&type=${type}&page=1&limit=20`
                );
                if (res.ok) {
                    const data = await res.json();
                    setPosts(data.data);
                    setTotal(data.total);
                }
            } catch (error) {
                console.error('검색 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, type]);

    const typeLabel = {
        title: '제목',
        content: '내용',
        author: '작성자',
    }[type];

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-6xl mx-auto px-6 py-12">
                {/* 헤더 */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft size={20} />
                        돌아가기
                    </Link>
                    <h1 className="text-3xl font-bold mb-2">검색 결과</h1>
                    <p className="text-gray-600">
                        <span className="font-semibold">&quot;{query}&quot;</span> (으)로 {typeLabel} 검색: 총 {total}개
                    </p>
                </div>

                {/* 검색 결과 */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : posts.length > 0 ? (
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
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                        <p className="text-gray-400 mt-2">다른 검색어로 시도해보세요.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
