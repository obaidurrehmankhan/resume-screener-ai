import type { RenderElementProps, RenderLeafProps } from 'slate-react'

/**
 * 🧱 Renders block elements like paragraph, headings, blockquotes
 */
export const renderElement = (props: RenderElementProps) => {
    const { element, children, attributes } = props

    switch (element.type) {
        case 'heading-one':
            return <h1 {...attributes}>{children}</h1>
        case 'heading-two':
            return <h2 {...attributes}>{children}</h2>
        case 'block-quote':
            return (
                <blockquote
                    className="border-l-4 pl-4 italic text-gray-600"
                    {...attributes}
                >
                    {children}
                </blockquote>
            )
        case 'horizontal-rule':
            return (
                <div {...attributes}>
                    <hr className="my-2" />
                    {children}
                </div>
            )
        case 'numbered-list':
            return <ol {...attributes} className="list-decimal pl-6">{children}</ol>
        case 'bulleted-list':
            return <ul {...attributes} className="list-disc pl-6">{children}</ul>
        case 'list-item':
            return <li {...attributes}>{children}</li>
        default:
            return <p {...attributes}>{children}</p>
    }
}

/**
 * 🖊️ Renders inline formatting like bold, italic, underline
 */
export const renderLeaf = (props: RenderLeafProps) => {
    const { attributes, children: initialChildren, leaf } = props

    let children = initialChildren

    if (leaf.bold) {
        children = <strong>{children}</strong>
    }

    if (leaf.italic) {
        children = <em>{children}</em>
    }

    if (leaf.underline) {
        children = <u>{children}</u>
    }

    if (leaf.fontFamily) {
        children = <span style={{ fontFamily: leaf.fontFamily }}>{children}</span>
    }

    return <span {...attributes}>{children}</span>
}
