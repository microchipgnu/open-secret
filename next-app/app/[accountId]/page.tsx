import { Chat } from '@/components/chat'

export default function Home({ params }: { params: { accountId: string } }) {
  return <div className="max-w">
    <Chat accountId={params.accountId} />
  </div>
}
