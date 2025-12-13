"use client";

import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditPostPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 게시물 데이터 가져오기
        const fetchPost = async () => {
            try {
                const res = await fetch(`http://localhost:3000/posts/${id}`);
                const post = await res.json();

                setTitle(post.title);
                setContent(post.content);
                setLoading(false);
            } catch (error) {
                console.error(error);
                alert('게시물을 불러올 수 없습니다');
                router.push('/');
            }
        };

        if (id) {
            fetchPost();
        }
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("로그인이 필요합니다.");
            router.push('/login');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`http://localhost:3000/posts/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content }),
            });

            if (!res.ok) {
                if (res.status === 403) {
                    alert("본인의 게시물만 수정할 수 있습니다.");
                    return;
                }
                throw new Error("Failed to update post");
            }

            alert("게시물이 수정되었습니다!");
            router.push(`/post/${id}`);
        } catch (error) {
            console.error("Error updating post:", error);
            alert("게시물 수정에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

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
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* 제목 입력 */}
                    <div>
                        <input
                            type="text"
                            placeholder="제목"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-3xl border-none outline-none focus:outline-none placeholder-gray-300 text-gray-900"
                        />
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    {/* 내용 입력 + 제출 버튼 */}
                    <div className="space-y-8">
                        <textarea
                            placeholder="내용을 입력하세요"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={15}
                            className="w-full resize-none border-none outline-none focus:outline-none placeholder-gray-300 text-gray-900 leading-relaxed"
                        />

                        <div className="flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="px-8 py-3 bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-700 transition-colors disabled:bg-gray-400"
                            >
                                {loading ? "수정 중..." : "수정"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}
