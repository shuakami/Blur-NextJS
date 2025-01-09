// src/extensions/CustomSelectExtension.ts
import {Extension} from '@tiptap/core';

const CustomSelectExtension = Extension.create({
    name: 'customSelect',

    addOptions() {
        return {
            timeThreshold: 300, // 两次按键之间的时间阈值（毫秒）
        };
    },

    addStorage() {
        return {
            lastKeyPressTime: 0,
        };
    },

    addKeyboardShortcuts() {
        return {
            'Mod-a': () => {
                const currentTime = Date.now();
                const timeDiff = currentTime - this.storage.lastKeyPressTime;

                if (timeDiff < this.options.timeThreshold) {
                    // 快速连续按下两次 Ctrl + A，全选所有内容
                    this.editor.commands.selectAll();
                } else {
                    // 第一次按下 Ctrl + A，全选当前块级节点（当前行）
                    const {from} = this.editor.state.selection;
                    const $from = this.editor.state.doc.resolve(from);
                    const startOfBlock = $from.start($from.depth);
                    const endOfBlock = $from.end($from.depth);
                    this.editor.commands.setTextSelection({from: startOfBlock, to: endOfBlock});
                }

                this.storage.lastKeyPressTime = currentTime;
                return true;
            },
        };
    },
});

export default CustomSelectExtension;
