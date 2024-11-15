import { Message } from "@/types/stream";

export interface Plugin {
    name: string;
    onChunk?: (chunk: {
        content: string;
        is_final_chunk: boolean;
    }) => {
        shouldAddMessage?: boolean;
        messageType?: string;
        messageContent?: string;
    } | void;
    onCreateBotMessage?: (message: Message) => Message;
}