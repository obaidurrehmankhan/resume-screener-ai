import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import ListItem from '@tiptap/extension-list-item'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Blockquote from '@tiptap/extension-blockquote'
import FontFamily from '@tiptap/extension-font-family'
import Underline from '@tiptap/extension-underline'
import type { Level } from '@tiptap/extension-heading'

import {
    Bold, Italic, Underline as UnderlineIcon,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Heading1, Heading2, Heading3, Heading4, Heading5, Heading6,
    List, ListOrdered, Quote, Minus,
} from 'lucide-react'

import './RichTextEditor.css'

/** Literal tuple -> items are 1|2|3|4|5|6, not number[] */
const HEADING_LEVELS = [1, 2, 3, 4, 5, 6] as const

const HeadingIcons = [Heading1, Heading2, Heading3, Heading4, Heading5, Heading6]

function ToolbarButton({
    title,
    active,
    onClick,
    children,
}: {
    title: string
    active?: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            aria-pressed={active}
            data-active={active ? 'true' : 'false'}
            className="
                p-2 rounded transition-colors
                text-gray-800 dark:text-gray-100
                hover:bg-gray-200 dark:hover:bg-gray-700
                data-[active=true]:bg-primary
                data-[active=true]:text-primary-foreground
            "
        >
            {children}
        </button>
    )
}

export default function RichTextEditor() {
    const editor = useEditor({
        extensions: [
            // Optional: explicitly set allowed heading levels (default is 1..6 anyway)
            StarterKit.configure({
                heading: { levels: HEADING_LEVELS as unknown as Level[] },
            }),
            Underline,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
                alignments: ['left', 'center', 'right', 'justify'],
            }),
            HorizontalRule,
            TextStyle,
            Color,
            FontFamily,
            ListItem,
            BulletList,
            OrderedList,
            Blockquote,
        ],
        content: '<p>Hello World!</p>',
    })

    // Re-render toolbar when selection/transaction changes so isActive() updates.
    const [, setTick] = React.useState(0)
    React.useEffect(() => {
        if (!editor) return
        const rerender = () => setTick(t => t + 1)
        editor.on('selectionUpdate', rerender)
        editor.on('transaction', rerender)
        editor.on('focus', rerender)
        editor.on('blur', rerender)
        return () => {
            editor.off('selectionUpdate', rerender)
            editor.off('transaction', rerender)
            editor.off('focus', rerender)
            editor.off('blur', rerender)
        }
    }, [editor])

    if (!editor) return null

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Toolbar */}
            <div className="border-b bg-gray-50 dark:bg-gray-800 p-2 flex flex-wrap gap-1">
                <div className="flex items-center border-r pr-2 gap-1">
                    <ToolbarButton
                        title="Bold"
                        active={editor.isActive('bold')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Italic"
                        active={editor.isActive('italic')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Underline"
                        active={editor.isActive('underline')}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <UnderlineIcon size={18} />
                    </ToolbarButton>
                </div>

                <div className="flex items-center border-r px-2 gap-1">
                    <ToolbarButton
                        title="Align Left"
                        active={editor.isActive({ textAlign: 'left' })}
                        onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    >
                        <AlignLeft size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Align Center"
                        active={editor.isActive({ textAlign: 'center' })}
                        onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    >
                        <AlignCenter size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Align Right"
                        active={editor.isActive({ textAlign: 'right' })}
                        onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    >
                        <AlignRight size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Justify"
                        active={editor.isActive({ textAlign: 'justify' })}
                        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                    >
                        <AlignJustify size={18} />
                    </ToolbarButton>
                </div>

                <div className="flex items-center border-r px-2 gap-1">
                    <ToolbarButton
                        title="Bullet List"
                        active={editor.isActive('bulletList')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Ordered List"
                        active={editor.isActive('orderedList')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Quote"
                        active={editor.isActive('blockquote')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <Quote size={18} />
                    </ToolbarButton>
                    <ToolbarButton
                        title="Horizontal Line"
                        onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    >
                        <Minus size={18} />
                    </ToolbarButton>
                </div>

                <div className="flex items-center border-r px-2 gap-2">
                    <select
                        defaultValue="Arial"
                        onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                        className="p-1 rounded border bg-white dark:bg-gray-700 dark:border-gray-600 text-gray-800 dark:text-gray-100"
                        title="Font Family"
                    >
                        <option>Arial</option>
                        <option>Times New Roman</option>
                        <option>Courier New</option>
                        <option>Georgia</option>
                        <option>Verdana</option>
                    </select>

                    <input
                        type="color"
                        onInput={(e) => editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()}
                        className="w-8 h-8 rounded cursor-pointer border border-gray-300 dark:border-gray-600"
                        title="Text Color"
                    />
                </div>

                <div className="flex items-center gap-1">
                    {HEADING_LEVELS.map((lvl) => {
                        const level: Level = lvl
                        const Icon = HeadingIcons[level - 1]
                        return (
                            <ToolbarButton
                                key={level}
                                title={`Heading ${level}`}
                                active={editor.isActive('heading', { level })}
                                onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                            >
                                <Icon size={18} />
                            </ToolbarButton>
                        )
                    })}
                </div>
            </div>

            {/* Editor */}
            <div className="p-4">
                <EditorContent editor={editor} className="prose max-w-none dark:prose-invert" />
            </div>
        </div>
    )
}
