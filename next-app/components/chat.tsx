'use client'

import { ChatRequest, FunctionCallHandler } from 'ai'
import { useChat, type Message } from 'ai/react'
import toast from 'react-hot-toast'

import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat-list'
import { ChatPanel } from '@/components/chat-panel'
import { ChatScrollAnchor } from '@/components/chat-scroll-anchor'
import { nanoid } from 'ai'
import { functionSchemas } from '@/lib/functions/schemas'
import { useTextToSpeachContext } from '@/lib/providers/text-to-speach-provider'

export interface ChatProps extends React.ComponentProps<'div'> {
    initialMessages?: Message[]
    id?: string
    showLanding?: boolean
    avatarUrl?: string
}

export function Chat({ id, initialMessages, className, showLanding = false, avatarUrl }: ChatProps) {
    const voiceId = 'alloy'
    const { toggleAudio } = useTextToSpeachContext();

    const functionCallHandler: FunctionCallHandler = async (
        chatMessages,
        functionCall
    ) => {
        if (functionCall.name === 'text_to_image') {
            // const response = await fetch('/api/text-to-image', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ text: functionCall.arguments })
            // })
            // if (!response.ok) {
            //     throw new Error(response.statusText)
            // }
            // const { arweaveId, arweaveUrl } = await response.json()


            // const functionResponse: ChatRequest = {
            //     messages: [
            //         ...chatMessages,
            //         {
            //             id: nanoid(),
            //             name: 'text_to_image',
            //             role: 'function',
            //             content: JSON.stringify({ arweaveId, arweaveUrl })
            //         }
            //     ],
            //     functions: functionSchemas
            // }
            // return functionResponse
        }
    }


    const { messages, append, reload, stop, isLoading, input, setInput } =
        useChat({
            experimental_onFunctionCall: functionCallHandler,
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
