import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
// npm install @tiptap/react @tiptap/core @tiptap/starter-kit
// npm install @tiptap/extension-underline @tiptap/extension-highlight
// npm install @tiptap/extension-link @tiptap/extension-color
// npm install @tiptap/extension-text-style @tiptap/extension-text-align
const extensions = [
  StarterKit.configure({
    underline: true,
    heading: true,
    orderedList: true,
    bulletList: true,
    blockquote: true,
  }),
  Underline,
  Highlight,
  Link,
  Color.configure({ types: ["textStyle"] }),
  TextStyle.configure({ types: ["textStyle", "paragraph"] }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

const content = ``;

const Tiptap = ({ onEditorContentSave }) => {
  const editor = useEditor({
    extensions,
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onEditorContentSave(html);
    },
  });

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const getButtonClass = (active) =>
    active
      ? "bg-blue-500 text-white px-2 py-1 rounded font-semibold"
      : "bg-white text-black px-2 py-1 rounded border border-gray-300 hover:bg-gray-100";
  return (
    <div className="mt-2">
      <div className="w-full flex flex-wrap gap-3 p-3 rounded bg-gray-600 text-white">
        <div className="bg-white rounded px-1 py-1 border border-gray-300">
          <input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
            value={editor.getAttributes("textStyle").color}
            className="w-6 h-6 border-none bg-transparent cursor-pointer"
          />
        </div>
        {/* <button
          onClick={setLink}
          className={getButtonClass(editor.isActive("link"))}
        >
          Link
        </button> */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={getButtonClass(editor.isActive("bold"))}
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={getButtonClass(editor.isActive("underline"))}
        >
          <u>U</u>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={getButtonClass(editor.isActive("italic"))}
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={getButtonClass(editor.isActive("strike"))}
        >
          <s>S</s>
        </button>
        {/* <button
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={getButtonClass(editor.isActive("highlight"))}
        >
          Highlight
        </button>
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={getButtonClass(editor.isActive("paragraph"))}
        >
          Paragraph
        </button>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            onClick={() =>
              editor.isActive("heading", { level })
                ? editor.chain().focus().setParagraph().run()
                : editor.chain().focus().setHeading({ level }).run()
            }
            className={getButtonClass(editor.isActive("heading", { level }))}
          >
            h{level}
          </button>
        ))}
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={getButtonClass(editor.isActive("orderedList"))}
        >
          OL
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={getButtonClass(editor.isActive("bulletList"))}
        >
          UL
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={getButtonClass(editor.isActive("blockquote"))}
        >
          " "
        </button>
        <button
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="bg-white text-black px-2 py-1 rounded border border-gray-300"
        >
          ---
        </button> */}
        {/* <button
          onClick={() => editor.chain().focus().setHardBreak().run()}
          className="bg-white text-black px-2 py-1 rounded border border-gray-300"
        >
          ↵
        </button> */}
        {/* <button
          onClick={() => editor.chain().focus().undo().run()}
          className="bg-white text-black px-2 py-1 rounded border border-gray-300"
        >
          Undo
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="bg-white text-black px-2 py-1 rounded border border-gray-300"
        >
          Redo
        </button>
        {["left", "center", "right", "justify"].map((align) => (
          <button
            key={align}
            onClick={() =>
              editor.isActive({ textAlign: align })
                ? editor.chain().focus().setTextAlign("left").run()
                : editor.chain().focus().setTextAlign(align).run()
            }
            className={getButtonClass(editor.isActive({ textAlign: align }))}
          >
            {align.charAt(0).toUpperCase() + align.slice(1)}
          </button>
        ))}
        <button
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Clear Marks
        </button> */}
      </div>
      <div className="border p-1 border-gray-500 text-slate-300 bg-slate-900 border-t-0">
        <EditorContent editor={editor} className="max-h-72 min-h-60 overflow-y-scroll" />
      </div>
    </div>
  );
};

export default Tiptap;
