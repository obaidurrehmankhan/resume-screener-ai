// components/shared/SlateEditorInput.tsx
import { useMemo } from 'react'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { createEditor } from 'slate'
import type { Descendant } from 'slate'

import { Toolbar } from './Toolbar'
import { renderElement, renderLeaf } from './utils/renderers'

type Props = {
    value: Descendant[]
    onChange: (value: Descendant[]) => void
    placeholder?: string
}

export default function SlateEditorInput({ value, onChange, placeholder }: Props) {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])

    return (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
            <Slate editor={editor} initialValue={value} onChange={onChange}>
                <Toolbar editor={editor} />
                <Editable
                    placeholder={placeholder}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    className="min-h-[300px] p-4 text-sm leading-6
                 bg-transparent text-zinc-800 dark:text-zinc-100
                 focus:outline-none"
                />
            </Slate>
        </div>

    )
}
