import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import React, { useCallback } from 'react'

import { menuBarStateSelector } from './menuBarState.js'
import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, Italic, Link, List, ListOrdered, ListTree, Underline } from 'lucide-react'

export const MenuBar = ({ editor }: { editor: Editor }) => {
  const editorState = useEditorState({
    editor,
    selector: menuBarStateSelector,
  });

  const setLink = useCallback((e: React.FormEvent)=> {
    e.preventDefault();
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if(url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }


    try {
      editor.chain().focus().extendMarkRange('link').setLink({href: (!url.includes("https://")) ? 'https://'+url : url, target:'_blank'}).run();
    } catch(e) {
      alert((e as Error).message);
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div className="control-group mb-5 border rounded-md w-fit p-2">
      <div className="button-group flex-row md:flex-col gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          disabled={!editorState.canBold}
          className={editorState.isBold ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
        >
          <Bold/>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          disabled={!editorState.canItalic}
          className={editorState.isItalic ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
        >
          <Italic/>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          disabled={!editorState.canUnderline}
          className={editorState.isUnderline ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
        >
          <Underline/>
        </button>
        <button
          onClick={(e) => setLink(e)}
          className={editorState.isLink ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
        >
          <Link/>
        </button>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={editorState.isOrderedList ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
        >
          <ListOrdered/>
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={editorState.isBulletList ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
        >
          <List/>
        </button>
        <button
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().sinkListItem('listItem').run();
            }}
            className={!editorState.canSinkListItem ? 'cursor-not-allowed text-gray-200 p-1' : 'text-gray p-1'}
            disabled={!editorState.canSinkListItem}

          >
            <ListTree/>
          </button>
         <button
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('left').run();
            }}
            className={editorState.isLeft ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
          >
            <AlignLeft/>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('center').run();
            }}
            className={editorState.isCenter ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
          >
            <AlignCenter/>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('right').run();
            }}
            className={editorState.isRight ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
          >
            <AlignRight/>
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().setTextAlign('justify').run();
            }}
            className={editorState.isJustify ? 'bg-gray-300 rounded-lg p-1' : 'p-1'}
          >
            <AlignJustify/>
          </button>
      </div>
    </div>
  )
}