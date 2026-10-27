import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extensions';
import { MenuBar } from './MenuBar'

export const TipTap = ({id, editable, value, error, onChange}:{id:number, editable:boolean, value:string, error:boolean, onChange: (html:string) => void}) => {
    const editor = useEditor({
        extensions: [
        StarterKit, 
        TextStyle, 
        TextAlign.configure({
        types: ['heading','paragraph']
        }), 
        Placeholder.configure({
            emptyNodeClass: 'first:before:text-gray-400 first:before:float-left first:before:content-[attr(data-placeholder)] first:before:h-0 first:before:pointer-events-none',
            placeholder: "Tulis isi materi artikel di sini...",
        }),
        ],
        editorProps: {
            attributes: {
            class: `prose prose-sm max-w-none min-h-[200px] focus:ring-2 focus:ring-primary focus:border-transparent h-100 p-4 border border-gray-200 rounded-md max-h-[400px] overflow-y-auto ${error && "border-2 border-red-600"}`,
            },
        },
        onUpdate: ({editor}) => {
            if(onChange) onChange(editor.getHTML());
        },
        content: value,
        editable: editable
    });

    useEffect(() => {
        if(!editor) return;

        const currentContent = editor.getHTML();
        if(value !== currentContent) {
            editor.commands.setContent(value);
        }
    },[id, editor])


    return (
    <>
        <MenuBar editor={editor}/>
        <EditorContent editor={editor} />
    </>
    );
}
