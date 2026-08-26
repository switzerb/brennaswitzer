import {PropsWithChildren} from "react";

interface MessageProps {
    speaker: 'me' | 'ChatGPT' | 'Claude'
    children: React.ReactNode
}

export function Message({ speaker, children }: MessageProps) {
    if (speaker === 'me') {
        return (
            <div className="mt-6 first:mt-0 flex justify-end">
                <span className="sr-only">Me: </span>
                <div className="max-w-[85%] rounded-[1.375rem] bg-foreground px-4 pb-4 text-background">
                    {children}
                </div>
            </div>
        )
    }

    if(speaker === 'Claude') return (
        <div className="mt-6 first:mt-0 flex justify-start">
            <span className="sr-only">Claude: </span>
            <div className="max-w-[85%] rounded-[1.375rem] bg-foreground/5 px-4 pb-4 pt-4 [&>p]:mt-2 [&>p:first-child]:mt-0">{children}</div>
        </div>
    )

    return (
        <div className="mt-6 first:mt-0 flex justify-start">
            <span className="sr-only">ChatGPT: </span>
            <div className="max-w-[85%] rounded-[1.375rem] bg-foreground/5 px-4 pb-4 pt-4 [&>p]:mt-2 [&>p:first-child]:mt-0">{children}</div>
        </div>
    )
}

export function Conversation({children}:PropsWithChildren) {
    return <div>{children}</div>
}