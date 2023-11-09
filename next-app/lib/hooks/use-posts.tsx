import { useEffect, useState } from 'react';
import { getPostsQuery } from '@/lib/data/posts-graphql';
import { useGraphQlQuery } from '../data/use-graphql-query';

export const usePosts = (accountId: string) => {
    const [posts, setPosts] = useState([]);

    const queryObj = {
        queryName: 'q_getPosts',
        query: getPostsQuery,
        variables: { accountId },
        queryOpts: { staleTime: Infinity, refetchInterval: 30000 },
        customUrl: "https://near-queryapi.api.pagoda.co/v1/graphql"
    };

    const { data, isLoading, refetch: refetchPosts } = useGraphQlQuery(queryObj);

    console.log('data', data);

    useEffect(() => {
        // Initial fetch or when new data comes in
        if (data?.dataplatform_near_social_feed_posts.length > 0 && !isLoading) {
            setPosts(data.dataplatform_near_social_feed_posts);
        }
    }, [data, isLoading]);

    return {
        posts,
        isLoading,
        refetchPosts,
    };
};
