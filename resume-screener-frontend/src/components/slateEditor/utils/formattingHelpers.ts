import {
    Editor,
    Element as SlateElement,
    Transforms,
} from 'slate'
import type { ReactEditor } from 'slate-react'
import type { BaseEditor } from 'slate'

type CustomEditor = BaseEditor & ReactEditor
type BlockFormat =
    | 'paragraph'
    | 'heading-one'
    | 'heading-two'
    | 'block-quote'
    | 'horizontal-rule'
    | 'bulleted-list'
    | 'numbered-list'
    | 'list-item'
    | 'align-left'
    | 'align-center'
    | 'align-right'

export const isMarkActive = (editor: CustomEditor, format: string): boolean => {
    const marks = Editor.marks(editor) as Record<string, unknown> | null
    return marks ? marks[format] === true : false
}

export const toggleMark = (editor: CustomEditor, format: string): void => {
    const active = isMarkActive(editor, format)
    if (active) {
        Editor.removeMark(editor, format)
    } else {
        Editor.addMark(editor, format, true)
    }
}

export const isBlockActive = (editor: CustomEditor, format: BlockFormat): boolean => {
    const [match] = Editor.nodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            n.type === format,
    })

    return !!match
}

export const toggleBlock = (editor: CustomEditor, format: BlockFormat): void => {
    const isActive = isBlockActive(editor, format)

    const isList = format === 'numbered-list' || format === 'bulleted-list'

    Transforms.unwrapNodes(editor, {
        match: n =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            (n.type === 'numbered-list' || n.type === 'bulleted-list'),
        split: true,
    })

    const newType = isActive ? 'paragraph' : isList ? 'list-item' : format

    Transforms.setNodes(editor, { type: newType })

    if (!isActive && isList) {
        const block = { type: format, children: [] }
        Transforms.wrapNodes(editor, block)
    }
}

