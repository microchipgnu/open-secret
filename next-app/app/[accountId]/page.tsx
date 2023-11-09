"use client"

import { Chat } from '@/components/chat';
import { IconSpinner } from '@/components/ui/icons';
import { usePosts } from '@/lib/hooks/use-posts';
import { useProfile } from '@/lib/hooks/use-profile';
import { Message } from 'ai';

const SYSTEM_MESSAGE: Message = {
  id: 'system0',
  role: "system",
  content: "Your role is to act as a digital mirror of the user's public persona on NEAR Social. Utilize the provided data to construct accurate responses regarding the user's social activities. Encourage dynamic interactions by summarizing posts, spotlighting trends, and stimulating dialogue based on discerned interests. Be concise.  When speaking on behalf of the user use the user's name.",
};

export default function Home({ params }: { params: { accountId: string } }) {
  const { accountId } = params;

  const { profileData, isLoading: isLoadingProfile } = useProfile(accountId);
  const { posts, isLoading: isLoadingPosts } = usePosts(accountId);


  console.log('profileData', profileData);
  console.log('posts', posts);
  
  if (!posts || !profileData) {
    return (
      <div className="max-w flex justify-center items-center">
        <IconSpinner className="animate-spin h-16 w-16 text-primary mt-20" />
      </div>
    );
  }

  const profileDataMessage: Message = {
    id: 'system1',
    role: 'system',
    content: JSON.stringify(profileData, null, 2)
  };

  const postsMessage: Message = {
    id: 'system2',
    role: 'system',
    content: JSON.stringify(posts, null, 2)
  };


  return (
    <div className="max-w">
      <Chat initialMessages={[SYSTEM_MESSAGE, profileDataMessage, postsMessage]} accountId={accountId} profileData={profileData} />
    </div>
  );
}
