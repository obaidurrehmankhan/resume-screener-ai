import { useCallback, useMemo } from 'react'
import { createEditor } from 'slate'
import type { Descendant } from 'slate'
import type { RenderElementProps } from 'slate-react'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history'

type Props = {
    value: Descendant[]
    onChange: (value: Descendant[]) => void
    placeholder?: string
}

export default function SlateEditorInput({ value, onChange, placeholder }: Props) {
    const editor = useMemo(() => withHistory(withReact(createEditor())), [])

    const renderElement = useCallback((props: RenderElementProps) => {
        const { attributes, children, element } = props

        switch (element.type) {
            case 'paragraph':
            default:
                return <p {...attributes}>{children}</p>
        }
    }, [])

    return (
        <div className="border rounded-md bg-card p-3 min-h-[200px]">
            <Slate editor={editor} initialValue={value} onChange={onChange}>
                <Editable
                    renderElement={renderElement}
                    placeholder={placeholder || 'Write something...'}
                    className="text-sm text-foreground dark:text-white focus:outline-none"
                    autoFocus
                />
            </Slate>
        </div>
    )
}
