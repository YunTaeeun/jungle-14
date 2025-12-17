'use client';

import { Suspense } from 'react';
import SearchResults from './SearchResults';
import Navigation from '@/components/Navigation';

export default function SearchPage() {
    return (
        <div className="min-h-screen bg-white">
            <Navigation />
            <Suspense fallback={
                <main className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                </main>
            }>
                <SearchResults />
            </Suspense>
        </div>
    );
}
