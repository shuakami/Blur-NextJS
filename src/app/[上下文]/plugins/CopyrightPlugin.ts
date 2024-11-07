// src/app/[上下文]/plugins/CopyrightPlugin.ts

import { DialogProcessorPlugin } from '../core/DialogProcessor';

const CopyrightPlugin: DialogProcessorPlugin = {
    onCreateBotMessage: (message) => {
        return {
            ...message,
            content: message.content + "\n\n© 2024 test",
        };
    },
};

export default CopyrightPlugin;
