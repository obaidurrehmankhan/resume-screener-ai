import type { BaseEditor, BaseElement, BaseText } from 'slate'
import type { ReactEditor } from 'slate-react'

export type CustomText = BaseText

export type CustomElement = {
    type: 'paragraph'
    children: CustomText[]
}

declare module 'slate' {
    interface CustomTypes {
        Editor: BaseEditor & ReactEditor
        Element: CustomElement
        Text: CustomText
    }
}
