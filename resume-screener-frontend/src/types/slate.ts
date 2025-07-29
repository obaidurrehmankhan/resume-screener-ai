import type { BaseEditor, Descendant } from 'slate'
import { ReactEditor } from 'slate-react'

export type CustomElement =
    | { type: 'paragraph'; children: Descendant[] }
    | { type: 'heading-one'; children: Descendant[] }
    | { type: 'heading-two'; children: Descendant[] }
    | { type: 'block-quote'; children: Descendant[] }
    | { type: 'horizontal-rule'; children: Descendant[] }
    | { type: 'bulleted-list'; children: Descendant[] }
    | { type: 'numbered-list'; children: Descendant[] }
    | { type: 'list-item'; children: Descendant[] }
    | { type: 'align-left'; children: Descendant[] }
    | { type: 'align-center'; children: Descendant[] }
    | { type: 'align-right'; children: Descendant[] }

export type CustomText = {
    text: string
    bold?: boolean
    italic?: boolean
    underline?: boolean
    fontFamily?: string
}

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor
        Element: CustomElement
        Text: CustomText
    }
}
