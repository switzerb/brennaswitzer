import {PropsWithChildren} from "react";

interface MessageProps {
    speaker: 'me' | 'ChatGPT'
    children: React.ReactNode
}

export function Message({ speaker, children }: MessageProps) {
    return (
        <div className="my-6">
            <h4>{speaker}</h4>
            <div>{children}</div>
        </div>
    )
}

export function Conversation({children}:PropsWithChildren) {
    return <div className="space-y-4">{children}</div>
}