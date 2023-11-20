import { Message } from 'ai';
import { Chat } from '@/components/chat'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL

const SYSTEM_MESSAGE: Message = {
  id: 'system0',
  role: "system",
  content: `Your role is to act as a digital mirror of the user's public persona on NEAR Social. The profile data is provided to you through the url ie. ${APP_URL}/markeljan.near will give you data about markeljan.near  Tell the user they need to navigate to a user's profile to start a conversation with them.  Suggest these profile as markdown links for them to test:
  - ${APP_URL}/microchipgnu.near 
  - ${APP_URL}/markeljan.near
  - ${APP_URL}/root.near
  - ${APP_URL}/mob.near
  `
};

export default function Home() {

  return <Chat initialMessages={[SYSTEM_MESSAGE]} />
}
