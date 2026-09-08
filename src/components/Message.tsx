import { PropsWithChildren } from "react";

interface MessageProps {
  speaker: "me" | "ChatGPT" | "Claude";
  children: React.ReactNode;
}

/* Transcripts in the Conversations series. Mine sit right and solid; the
   machine's sit left on the sunk ground, the way the apps themselves do. */
export function Message({ speaker, children }: MessageProps) {
  if (speaker === "me") {
    return (
      <div className="mt-6 first:mt-0 flex justify-end">
        <span className="sr-only">Me: </span>
        <div className="max-w-[85%] bg-graphite px-4 py-3 text-paper [&>p]:mt-2 [&>p:first-child]:mt-0">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 first:mt-0 flex justify-start">
      <span className="sr-only">{speaker}: </span>
      <div className="max-w-[85%] border-l-2 border-accent bg-sunk px-4 py-3 [&>p]:mt-2 [&>p:first-child]:mt-0">
        {children}
      </div>
    </div>
  );
}

export function Conversation({ children }: PropsWithChildren) {
  return <div>{children}</div>;
}
