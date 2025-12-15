'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export default function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState('');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        // "작성자:나" 형식 파싱
        let searchQuery = query;
        let searchType = 'title';

        if (query.includes('작성자:')) {
            searchQuery = query.split('작성자:')[1].trim();
            searchType = 'author';
        } else if (query.includes('내용:')) {
            searchQuery = query.split('내용:')[1].trim();
            searchType = 'content';
        }

        router.push(`/search?query=${encodeURIComponent(searchQuery)}&type=${searchType}`);
    };

    return (
        <form onSubmit={handleSearch} className="w-full">
            <div className="flex items-center border-b-2 border-black pb-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="검색어 (작성자:이름 또는 내용:키워드)"
                    className="flex-1 outline-none text-lg py-1"
                />
                <button type="submit" className="ml-2">
                    <ArrowRight size={24} className="text-black" />
                </button>
            </div>
        </form>
    );
}
