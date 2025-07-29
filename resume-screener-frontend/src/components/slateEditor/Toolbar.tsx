import React from 'react'
import type { BaseEditor } from 'slate'
import { ReactEditor } from 'slate-react'
import {
    Bold,
    Italic,
    Underline,
    Heading1,
    Heading2,
    Quote,
    Minus,
    List,
    ListOrdered
} from 'lucide-react'

import { toggleMark, toggleBlock, isMarkActive, isBlockActive } from './utils/formattingHelpers'
import ToolbarButton from './ToolbarButton'
import FontFamilySelect from './FontFamilySelect'

type ToolbarProps = {
    editor: BaseEditor & ReactEditor
}

export const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 p-2 
                border-b shadow-sm sticky top-0 z-10 
                bg-white dark:bg-zinc-800 
                border-zinc-200 dark:border-zinc-700 
                rounded-t-md">

            {/* Mark Buttons */}
            <ToolbarButton
                active={isMarkActive(editor, 'bold')}
                onClick={() => toggleMark(editor, 'bold')}
                label={<Bold size={16} />}
                tooltip="Bold ⌘B"
            />
            <ToolbarButton
                active={isMarkActive(editor, 'italic')}
                onClick={() => toggleMark(editor, 'italic')}
                label={<Italic size={16} />}
                tooltip="Italic ⌘I"
            />
            <ToolbarButton
                active={isMarkActive(editor, 'underline')}
                onClick={() => toggleMark(editor, 'underline')}
                label={<Underline size={16} />}
                tooltip="Underline ⌘U"
            />

            {/* Block Buttons */}
            <ToolbarButton
                active={isBlockActive(editor, 'heading-one')}
                onClick={() => toggleBlock(editor, 'heading-one')}
                label={<Heading1 size={16} />}
                tooltip="Heading 1"
            />
            <ToolbarButton
                active={isBlockActive(editor, 'heading-two')}
                onClick={() => toggleBlock(editor, 'heading-two')}
                label={<Heading2 size={16} />}
                tooltip="Heading 2"
            />
            <ToolbarButton
                active={isBlockActive(editor, 'block-quote')}
                onClick={() => toggleBlock(editor, 'block-quote')}
                label={<Quote size={16} />}
                tooltip="Blockquote"
            />
            <ToolbarButton
                active={isBlockActive(editor, 'horizontal-rule')}
                onClick={() => toggleBlock(editor, 'horizontal-rule')}
                label={<Minus size={16} />}
                tooltip="Horizontal Line"
            />

            {/* List Buttons */}
            <ToolbarButton
                active={isBlockActive(editor, 'bulleted-list')}
                onClick={() => toggleBlock(editor, 'bulleted-list')}
                label={<List size={16} />}
                tooltip="Unordered List"
            />
            <ToolbarButton
                active={isBlockActive(editor, 'numbered-list')}
                onClick={() => toggleBlock(editor, 'numbered-list')}
                label={<ListOrdered size={16} />}
                tooltip="Ordered List"
            />

            <ToolbarButton
                active={isBlockActive(editor, 'align-left')}
                onClick={() => toggleBlock(editor, 'align-left')}
                label="⬅"
                tooltip="Align Left"
            />
            <ToolbarButton
                active={isBlockActive(editor, 'align-center')}
                onClick={() => toggleBlock(editor, 'align-center')}
                label="⭯"
                tooltip="Align Center"
            />
            <ToolbarButton
                active={isBlockActive(editor, 'align-right')}
                onClick={() => toggleBlock(editor, 'align-right')}
                label="➡"
                tooltip="Align Right"
            />

            {/* Font Family Dropdown */}
            <FontFamilySelect onChange={(val) => editor.addMark('fontFamily', val)} />

        </div >
    )
}
