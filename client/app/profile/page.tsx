"use client";

import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 내 정보 가져오기
                const userRes = await fetch('http://localhost:3000/users/me', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });

                if (!userRes.ok) {
                    console.error('인증 실패: 토큰이 만료되었거나 유효하지 않습니다.');
                    throw new Error('인증 실패');
                }

                const userData = await userRes.json();

                // 응답 데이터 검증
                if (!userData || !userData.id) {
                    console.error('잘못된 사용자 데이터:', userData);
                    throw new Error('사용자 정보를 가져올 수 없습니다');
                }
                setUser(userData);

                // 전체 게시물 중 내 게시물만 필터링
                const postsRes = await fetch('http://localhost:3000/posts?page=1&limit=100');
                const postsData = await postsRes.json();
                const myPosts = postsData.data.filter((post: any) => post.author.id === userData.id);
                setPosts(myPosts);

                setLoading(false);
            } catch (error) {
                console.error(error);
                localStorage.removeItem('token'); // 토큰 제거
                router.push('/login');
            }
        };

        fetchProfile();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="space-y-12">
                    {/* 사용자 정보 */}
                    <div className="space-y-4">
                        <h1 className="text-4xl text-gray-900">
                            {user?.nickname || user?.username}
                        </h1>
                        <p className="text-base text-gray-600">{user?.email}</p>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    {/* 작성한 글 목록 */}
                    <div className="space-y-6">
                        <h2 className="text-xl text-gray-700">작성한 글</h2>
                        {posts.length === 0 ? (
                            <p className="text-gray-500">작성한 글이 없습니다.</p>
                        ) : (
                            <div className="space-y-4">
                                {posts.map((post: any) => (
                                    <Link
                                        key={post.id}
                                        href={`/post/${post.id}`}
                                        className="block group"
                                    >
                                        <div className="flex justify-between items-baseline border-b border-gray-200 pb-3 hover:border-gray-400 transition-colors">
                                            <span className="text-base text-gray-900 group-hover:text-gray-600 transition-colors">
                                                {post.title}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {new Date(post.createdAt).toLocaleDateString("ko-KR")}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
