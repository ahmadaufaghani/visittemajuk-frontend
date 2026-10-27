import type { Editor } from '@tiptap/core'
import type { EditorStateSnapshot } from '@tiptap/react'

/**
 * State selector for the MenuBar component.
 * Extracts the relevant editor state for rendering menu buttons.
 */
export function menuBarStateSelector(ctx: EditorStateSnapshot<Editor>) {
  return {
    // Text formatting
    isBold: ctx.editor.isActive('bold') ?? false,
    canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
    isItalic: ctx.editor.isActive('italic') ?? false,
    canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
    isUnderline: ctx.editor.isActive('underline') ?? false,
    canUnderline: ctx.editor.can().chain().toggleUnderline().run() ?? false,
    isLink: ctx.editor.isActive('link'),  


    // Lists and blocks
    isBulletList: ctx.editor.isActive('bulletList') ?? false,
    isOrderedList: ctx.editor.isActive('orderedList') ?? false,
    canSinkListItem: ctx.editor.can().sinkListItem('listItem') ?? false,

    //Text alignment
    isLeft: ctx.editor.isActive({ textAlign: 'left' }) ?? false,
    isCenter: ctx.editor.isActive({ textAlign: 'center' }) ?? false,
    isRight: ctx.editor.isActive({ textAlign: 'right' }) ?? false,
    isJustify: ctx.editor.isActive({ textAlign: 'justify' }) ?? false,
  }
}

export type MenuBarState = ReturnType<typeof menuBarStateSelector>