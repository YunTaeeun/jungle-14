"use client";

import Navigation from "@/components/Navigation";
import RichEditor from "@/components/RichEditor";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft } from "lucide-react";
import DOMPurify from 'dompurify';

export default function WritePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

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
            // DOMPurify로 HTML sanitize (XSS 방어)
            const sanitizedContent = DOMPurify.sanitize(content, {
                ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'span', 'div', 'h1', 'h2', 'h3', 'ul', 'ol', 'li'],
                ALLOWED_ATTR: ['style'],
            });

            const res = await fetch("http://localhost:3000/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content: sanitizedContent
                }),
            });

            if (!res.ok) {
                if (res.status === 401) {
                    alert("로그인이 필요합니다.");
                    router.push('/login');
                    return;
                }
                throw new Error("Failed to create post");
            }

            alert("게시물이 작성되었습니다!");
            router.push("/");
        } catch (error) {
            console.error("Error creating post:", error);
            alert("게시물 작성에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 제목 입력 */}
                    <div>
                        <input
                            type="text"
                            placeholder="제목"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full text-3xl border-none outline-none placeholder-gray-500 text-gray-900"
                        />
                    </div>

                    <div className="h-px bg-gray-400"></div>

                    {/* 리치 에디터 */}
                    <RichEditor content={content} onChange={setContent} />

                    {/* 제출 버튼 */}
                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="p-3 bg-black text-white hover:bg-gray-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                        >
                            <CornerDownLeft size={20} />
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
