import { type Message } from 'ai'

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat-message'
import { Button } from './ui/button'

export interface ChatList {
    messages: Message[]
}

export function ChatList({ messages }: ChatList) {
    if (!messages.length) {
        return null
    }


    return (
        <div className="relative mx-auto max-w-2xl px-4">
            {messages.map((message, index) => {
                if (message.role === "function") {
                    return
                }
                if (message.role === "system") {
                    return
                }
                if (message.function_call) {
                    return (
                        <div key={index}>
                            <Button className='pointer-events-none' variant='secondary' size='lg'>
                                Generating Image...
                            </Button>
                            <Separator className="my-4 md:my-8" />
                        </div>
                    )
                } else {
                    return (
                        <div key={index}>
                            <ChatMessage message={message} />
                            {index < messages.length - 1 && (
                                <Separator className="my-4 md:my-8" />
                            )}
                        </div>)
                }
            }
            )}
        </div>
    )
}