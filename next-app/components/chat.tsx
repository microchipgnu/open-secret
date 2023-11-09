'use client'

import { useChat, type Message } from 'ai/react'
import toast from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { ProfileCard } from '@/components/profile-card'
import { useTextToSpeachContext } from '@/lib/providers/text-to-speach-provider'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    avatarUrl?: string
    accountId?: string
    profileData?: any
}

export function Chat({ id, initialMessages, accountId, className, profileData }: ChatProps) {
    const voiceId = 'alloy'
    const { toggleAudio } = useTextToSpeachContext();



    const { messages, append, reload, stop, isLoading, input, setInput } =
        useChat({
            initialMessages,
            id,
            body: {
                id
            },
            onResponse(response) {
                if (response.status === 401) {
                    toast.error(response.statusText)
                }
            },
            onFinish(message) {
                toggleAudio(message.content, voiceId)
            }
        })

    return (
        <>
            <div className={cn('pb-[200px] pt-4 md:pt-10 px-4', className)}>
                {profileData &&
                    <div className='flex w-full mx-auto justify-center align-center mb-10'>
                        <ProfileCard profileData={profileData} />
                    </div>
                }
                <ChatList messages={messages} />
                <ChatScrollAnchor trackVisibility={isLoading} />
            </div>



            <ChatPanel
                id={id}
                isLoading={isLoading}
                stop={stop}
                append={append}
                reload={reload}
                messages={messages}
                input={input}
                setInput={setInput}
            />
        </>
    )
}
