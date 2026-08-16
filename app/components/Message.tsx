import {PropsWithChildren} from "react";

interface MessageProps {
    speaker: 'me' | 'ChatGPT'
    children: React.ReactNode
}

export function Message({ speaker, children }: MessageProps) {
    return (
        <div className="mt-5 first:mt-0">
            <p className="text-xs font-medium uppercase tracking-wide text-accent mb-1">
                {speaker}
            </p>
            <div className="[&>p]:mt-2 [&>p:first-child]:mt-0">{children}</div>
        </div>
    )
}

export function Conversation({children}:PropsWithChildren) {
    return <div>{children}</div>
}