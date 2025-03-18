import { useInfiniteQuery } from "@tanstack/react-query";

const fetchPosts = async ({ pageParam = 1 }) => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${API_BASE_URL}/api/post/getPosts?page=${pageParam}&limit=6`);
  
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

export const useFetchPosts = () => {
  return useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts, 
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPage;
    },
  });
};
