"use client"

import { Chat } from '@/components/chat';
import { usePosts } from '@/lib/hooks/use-posts';
import { useProfile } from '@/lib/hooks/use-profile';
import { toNearAccount } from '@/lib/utils';
import { Message } from 'ai';

const SYSTEM_MESSAGE: Message = {
  id: 'system0',
  role: "system",
  content: "Your role is to act as a digital mirror of the user's public persona on NEAR Social. Utilize the provided data to construct accurate responses regarding the user's social activities. Encourage dynamic interactions by summarizing posts, spotlighting trends, and stimulating dialogue based on discerned interests. Be concise.  When speaking on behalf of the user use the profile name.  If profileData is not found tell the user and suggest that they try again with a different NEAR account."
};

export default function Home({ params }: { params: { accountId: string } }) {
  const accountId = toNearAccount(params.accountId);

  const { profileData, isLoading: isLoadingProfile } = useProfile(accountId);
  const { posts, isLoading: isLoadingPosts } = usePosts(accountId);


  console.log('profileData', profileData);
  console.log('posts', posts);


  const profileDataMessage: Message = {
    id: 'system1',
    role: 'system',
    content: JSON.stringify(profileData, null, 4) || `ERROR: ${accountId} profileData not found`
  };

  const postsMessage: Message = {
    id: 'system2',
    role: 'system',
    content: JSON.stringify(posts, null, 4) || `ERROR: ${accountId} posts not found or no posts`
  };

  if (!posts || !profileData) {
    return (
      <Chat initialMessages={[SYSTEM_MESSAGE, profileDataMessage, postsMessage]} />
    );
  }

  return (
    <div className="max-w">
      <Chat initialMessages={[SYSTEM_MESSAGE, profileDataMessage, postsMessage]} profileData={profileData} />
    </div>
  );
}
