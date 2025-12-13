import Navigation from "@/components/Navigation";
import Link from "next/link";

// 백엔드에서 사용자 정보 가져오기 (임시로 더미 데이터)
async function getUser(id: string) {
    // TODO: 백엔드에 사용자 API 구현 후 연결
    return {
        id: parseInt(id),
        name: "사용자 " + id,
        bio: "미니멀 디자인을 좋아하는 사용자입니다.",
    };
}

// 사용자가 작성한 게시물 가져오기
async function getUserPosts(userId: string) {
    try {
        const res = await fetch("http://localhost:3000/posts", {
            cache: "no-store",
        });

        if (!res.ok) {
            throw new Error("Failed to fetch posts");
        }

        const allPosts = await res.json();
        // TODO: 백엔드에 사용자 필터링 API 구현 후 수정
        return allPosts.slice(0, 3); // 임시로 최근 3개만
    } catch (error) {
        console.error("Error fetching user posts:", error);
        return [];
    }
}

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const user = await getUser(id);
    const userPosts = await getUserPosts(id);

    return (
        <div className="min-h-screen bg-white">
            <Navigation />

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="space-y-12">
                    {/* 사용자 정보 */}
                    <div className="space-y-4">
                        <h1 className="text-4xl text-gray-900">{user.name}</h1>
                        <p className="text-base text-gray-600">{user.bio}</p>
                    </div>

                    <div className="h-px bg-gray-200"></div>

                    {/* 작성한 글 목록 */}
                    <div className="space-y-6">
                        <h2 className="text-xl text-gray-700">작성한 글</h2>
                        {userPosts.length === 0 ? (
                            <p className="text-gray-500">작성한 글이 없습니다.</p>
                        ) : (
                            <div className="space-y-4">
                                {userPosts.map((post: any) => (
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
