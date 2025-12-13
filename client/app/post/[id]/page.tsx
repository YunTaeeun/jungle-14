import PostDetailClient from "./PostDetailClient";

// 백엔드에서 게시물 가져오기
async function getPost(id: string) {
    try {
        const res = await fetch(`http://localhost:3000/posts/${id}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            throw new Error('Failed to fetch post');
        }

        return res.json();
    } catch (error) {
        console.error('Error fetching post:', error);
        return null;
    }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <p className="text-center text-gray-500">게시물을 찾을 수 없습니다.</p>
            </div>
        );
    }

    return <PostDetailClient post={post} />;
}
