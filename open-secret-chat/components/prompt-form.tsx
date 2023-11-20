import { useEffect, useRef } from 'react'
import { UseChatHelpers } from 'ai/react'
import Textarea from 'react-textarea-autosize'

import { Button, buttonVariants } from '@/components/ui/button'
import { VoiceInputButton } from '@/components/voice-input-button'
import { IconArrowElbow, IconHome } from '@/components/ui/icons'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from '@/components/ui/tooltip'
import { useEnterSubmit } from '@/lib/hooks/use-enter-submit'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/lib/hooks/use-voice-input'


export interface PromptProps
    extends Pick<UseChatHelpers, 'input' | 'setInput'> {
    onSubmit: (value: string) => Promise<void>
    isLoading: boolean
}

export function PromptForm({
    onSubmit,
    input,
    setInput,
    isLoading
}: PromptProps) {
    const { formRef, onKeyDown } = useEnterSubmit()
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const { transcript, isRecording, handleToggleRecording } = useVoiceInput(() => {
        formRef.current?.requestSubmit()
    })

    // focus to the input when the page loads
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

    // sync transcript to input
    useEffect(() => {
        if (transcript) {
            setInput(transcript)
        }
    }, [transcript, setInput])

    return (
        <form
            onSubmit={async e => {
                e.preventDefault()
                if (!input?.trim() || isLoading) {
                    return
                }
                setInput('')
                await onSubmit(input)
            }}
            ref={formRef}
        >
            <div className="relative flex max-h-60 w-full grow flex-col overflow-hidden bg-background px-8 sm:rounded-md sm:border sm:px-12">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button
                            onClick={() => {
                                location.href = '/'
                            }}
                            className={cn(
                                buttonVariants({ size: 'sm', variant: 'outline' }),
                                'absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4'
                            )}
                        >
                            <IconHome />
                            <span className="sr-only">New Chat</span>
                        </button>
                    </TooltipTrigger>
                    <TooltipContent>New Chat</TooltipContent>
                </Tooltip>
                <Textarea
                    ref={inputRef}
                    tabIndex={0}
                    onKeyDown={onKeyDown}
                    rows={1}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Send a message."
                    spellCheck={false}
                    className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                />
                <div className="absolute flex right-0 top-3 sm:right-4 gap-1">
                    <VoiceInputButton isRecording={isRecording} handleToggleRecording={handleToggleRecording} />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || input === ''}
                            >
                                <IconArrowElbow />
                                <span className="sr-only">Send message</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Send message</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </form >
    )
}