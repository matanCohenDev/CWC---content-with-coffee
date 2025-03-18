import { useInfiniteQuery } from "@tanstack/react-query";

const fetchUserPosts = async ({ pageParam = 1, queryKey }: any) => {
  const [, userId] = queryKey; // queryKey is ['userPosts', userId]
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(
    `${API_BASE_URL}/api/post/getPostByUserId/${userId}?page=${pageParam}&limit=6`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    }
  );

  if (!res.ok) {
    console.error("❌ API Request failed:", res.status);
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }

  const data = await res.json();
  return {
    posts: data.posts,
    nextPage: data.hasMore ? pageParam + 1 : undefined,
  };
};

export const useFetchUserPosts = (userId: string) => {
  return useInfiniteQuery({
    queryKey: ["userPosts", userId],
    queryFn: fetchUserPosts,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
  });
};