import {PropsWithChildren} from "react";

interface MessageProps {
    speaker: 'me' | 'ChatGPT'
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

    return (
        <div className="mt-6 first:mt-0">
            <span className="sr-only">ChatGPT: </span>
            <div className="[&>p]:mt-2 [&>p:first-child]:mt-0">{children}</div>
        </div>
    )
}

export function Conversation({children}:PropsWithChildren) {
    return <div>{children}</div>
}