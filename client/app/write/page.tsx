"use client";

import Navigation from "@/components/Navigation";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Bold, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import DOMPurify from 'dompurify';

const FONTS = [
    { name: '기본', value: 'inherit' },
    { name: '국립박물관문화재단 클래식', value: 'Gungsuh' },
    { name: 'HS봄바람체 2.1', value: 'cursive' },
    { name: '310 안삼열2.0', value: 'fantasy' },
    { name: '청월', value: 'serif' },
    { name: 'Sandoll 광화문', value: 'sans-serif' },
    { name: '타이포_소설체', value: 'monospace' },
];

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

export default function WritePage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const applyStyle = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        contentRef.current?.focus();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !contentRef.current?.innerHTML) {
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
            const sanitizedContent = DOMPurify.sanitize(contentRef.current.innerHTML, {
                ALLOWED_TAGS: ['p', 'br', 'b', 'strong', 'i', 'em', 'u', 'span', 'div'],
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

                    {/* 에디터 툴바 */}
                    <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-300">
                        {/* 폰트 선택 */}
                        <select
                            onChange={(e) => applyStyle('fontName', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                            {FONTS.map(font => (
                                <option key={font.value} value={font.value}>{font.name}</option>
                            ))}
                        </select>

                        {/* 폰트 사이즈 */}
                        <select
                            onChange={(e) => applyStyle('fontSize', '7')}
                            className="px-3 py-1 border border-gray-300 rounded text-sm"
                        >
                            {SIZES.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>

                        {/* 볼드 */}
                        <button
                            type="button"
                            onClick={() => applyStyle('bold')}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            <Bold size={18} />
                        </button>

                        {/* 정렬 */}
                        <button
                            type="button"
                            onClick={() => applyStyle('justifyLeft')}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            <AlignLeft size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyStyle('justifyCenter')}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            <AlignCenter size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => applyStyle('justifyRight')}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                        >
                            <AlignRight size={18} />
                        </button>
                    </div>

                    {/* 내용 입력 (contentEditable) */}
                    <div
                        ref={contentRef}
                        contentEditable
                        onInput={(e) => setContent(e.currentTarget.innerHTML)}
                        className="min-h-[400px] outline-none text-gray-900 leading-relaxed"
                        style={{ whiteSpace: 'pre-wrap' }}
                        data-placeholder="내용을 입력하세요"
                    />

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

            <style jsx>{`
                [contentEditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #9ca3af;
                }
            `}</style>
        </div>
    );
}
