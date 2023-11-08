'use client'

import { type Message } from 'ai'

import { Button } from '@/components/ui/button'
import { IconCheck, IconCopy, IconSpinner } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { useTextToSpeech } from '@/lib/hooks/use-text-to-speech'
import { Pause, Play } from 'lucide-react'

interface ChatMessageActionsProps extends React.ComponentProps<'div'> {
    message: Message
}

export function ChatMessageActions({
    message,
    className,
    ...props
}: ChatMessageActionsProps) {
    const { isCopied, copyToClipboard } = useCopyToClipboard({ timeout: 2000 })
    const { isLoading, isPlaying, toggleAudio } = useTextToSpeech()

    const onCopy = () => {
        if (isCopied) return
        copyToClipboard(message.content)
    }

    const onToggleAudio = () => {
        toggleAudio(message.content)
    }

    return (
        <div
            className={cn(
                'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-16 md:-top-2 md:opacity-0',
                className
            )}
            {...props}
        >
            <Button variant="ghost" size="icon" onClick={onCopy}>
                {isCopied ? <IconCheck /> : <IconCopy />}
                <span className="sr-only">Copy message</span>
            </Button>
             {message.role === 'assistant' && (
                <Button variant="ghost" size="icon" onClick={onToggleAudio}>
                    {isLoading ? <IconSpinner /> : isPlaying ? <Pause className='h-4 w-4' /> : <Play className='h-4 w-4' />}
                    <span className="sr-only">Play message</span>
                </Button>
            )}
        </div>
    )
}