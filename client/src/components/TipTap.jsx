import { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Blockquote from "@tiptap/extension-blockquote";
import { Color } from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdStrikethroughS,
  MdFormatListBulleted,
  MdFormatListNumbered,
  MdFormatQuote,
  MdLink,
  MdUndo,
  MdRedo,
  MdFormatClear,
  MdFormatAlignLeft,
  MdFormatAlignCenter,
  MdFormatAlignRight,
  MdFormatAlignJustify,
  MdColorize,
  MdSettings,
  MdExpandMore,
  MdExpandLess
} from 'react-icons/md';
const extensions = [
  StarterKit.configure({
    underline: true,
    heading: true,
    orderedList: true,
    bulletList: true,
    blockquote: false, // Disable default blockquote to use custom one
  }),
  Underline,
  Highlight,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      // Set color to blue for email output, editor styling handled separately
      style: 'color: #0066cc; text-decoration: underline;',
      class: 'email-link',
    },
  }),
  Blockquote.configure({
    HTMLAttributes: {
      // Inline styles that will appear in email output
      style: 'border-left: 4px solid #f97316; padding-left: 16px; margin: 16px 0; background-color: #fef3e2; border-radius: 0 8px 8px 0; color: #000000;',
      class: 'email-blockquote',
    },
  }),
  Color.configure({ types: ["textStyle"] }),
  TextStyle.configure({ types: ["textStyle", "paragraph"] }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
];

const Tiptap = ({ onEditorContentSave }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const editor = useEditor({
    extensions,
    content: '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = text.split(/\s+/).filter(word => word.length > 0).length;
      setWordCount(words);
      onEditorContentSave(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);
    
    if (url === null) return;
    
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const getButtonClass = (active, variant = 'default') => {
    const baseClass = 'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 transform hover:scale-105 border';
    
    if (active) {
      return `${baseClass} bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 border-orange-400/50`;
    }
    
    if (variant === 'utility') {
      return `${baseClass} bg-gray-700/40 hover:bg-gray-600/60 text-gray-300 hover:text-white border-gray-600/30 hover:border-gray-500/50`;
    }
    
    return `${baseClass} bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white border-orange-500/20 hover:border-orange-400/40`;
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl border border-orange-500/20 shadow-2xl shadow-orange-500/10 overflow-hidden flex flex-col max-h-[450px]">
      {/* Sticky Toolbar */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-800/95 to-gray-700/95 backdrop-blur-md p-4 border-b border-orange-500/20 rounded-t-2xl">
        {/* Primary Formatting Tools */}
        <div className="flex flex-wrap gap-2 mb-3">
          {/* Text Formatting Group */}
          <div className="flex gap-1 bg-gray-800/40 p-1 rounded-xl border border-gray-600/30">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={getButtonClass(editor.isActive('bold'))}
              title="Bold (Ctrl+B)"
            >
              <MdFormatBold className="text-lg" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={getButtonClass(editor.isActive('italic'))}
              title="Italic (Ctrl+I)"
            >
              <MdFormatItalic className="text-lg" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={getButtonClass(editor.isActive('underline'))}
              title="Underline (Ctrl+U)"
            >
              <MdFormatUnderlined className="text-lg" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={getButtonClass(editor.isActive('strike'))}
              title="Strikethrough"
            >
              <MdStrikethroughS className="text-lg" />
            </button>
          </div>

          {/* Lists Group */}
          <div className="flex gap-1 bg-gray-800/40 p-1 rounded-xl border border-gray-600/30">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={getButtonClass(editor.isActive('bulletList'))}
              title="Bullet List"
            >
              <MdFormatListBulleted className="text-lg" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={getButtonClass(editor.isActive('orderedList'))}
              title="Numbered List"
            >
              <MdFormatListNumbered className="text-lg" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={getButtonClass(editor.isActive('blockquote'))}
              title="Quote"
            >
              <MdFormatQuote className="text-lg" />
            </button>
          </div>

          {/* Color and Link Group */}
          <div className="flex gap-1 bg-gray-800/40 p-1 rounded-xl border border-gray-600/30">
            <div className="flex items-center justify-center w-10 h-10 bg-gray-700/60 rounded-lg border border-gray-600/30">
              <input
                type="color"
                onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
                value={editor.getAttributes('textStyle').color || '#ffffff'}
                className="w-6 h-6 border-none bg-transparent cursor-pointer rounded"
                title="Text Color"
              />
            </div>
            <button
              onClick={setLink}
              className={getButtonClass(editor.isActive('link'))}
              title="Add/Edit Link"
            >
              <MdLink className="text-lg" />
            </button>
          </div>

          {/* Utility Group */}
          <div className="flex gap-1 bg-gray-800/40 p-1 rounded-xl border border-gray-600/30">
            <button
              onClick={() => editor.chain().focus().undo().run()}
              className={getButtonClass(false, 'utility')}
              disabled={!editor.can().undo()}
              title="Undo (Ctrl+Z)"
            >
              <MdUndo className="text-lg" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              className={getButtonClass(false, 'utility')}
              disabled={!editor.can().redo()}
              title="Redo (Ctrl+Y)"
            >
              <MdRedo className="text-lg" />
            </button>
            <button
              onClick={() => editor.chain().focus().unsetAllMarks().run()}
              className={getButtonClass(false, 'utility')}
              title="Clear Formatting"
            >
              <MdFormatClear className="text-lg" />
            </button>
          </div>

          {/* Advanced Options Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 h-10 rounded-lg transition-all duration-300 border ${
              showAdvanced 
                ? 'bg-orange-500/20 text-orange-300 border-orange-400/30' 
                : 'bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white border-gray-600/30'
            }`}
            title="Advanced Options"
          >
            <MdSettings className="text-lg" />
            <span className="text-sm font-medium hidden sm:block">Advanced</span>
            {showAdvanced ? <MdExpandLess /> : <MdExpandMore />}
          </button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-600/20">
            {/* Alignment Group */}
            <div className="flex gap-1 bg-gray-800/40 p-1 rounded-xl border border-gray-600/30">
              {[
                { align: 'left', icon: MdFormatAlignLeft, title: 'Align Left' },
                { align: 'center', icon: MdFormatAlignCenter, title: 'Align Center' },
                { align: 'right', icon: MdFormatAlignRight, title: 'Align Right' },
                { align: 'justify', icon: MdFormatAlignJustify, title: 'Justify' }
              ].map(({ align, icon: Icon, title }) => (
                <button
                  key={align}
                  onClick={() => editor.chain().focus().setTextAlign(align).run()}
                  className={getButtonClass(editor.isActive({ textAlign: align }))}
                  title={title}
                >
                  <Icon className="text-lg" />
                </button>
              ))}
            </div>

            {/* Headings Group */}
            <div className="flex gap-1 bg-gray-800/40 p-1 rounded-xl border border-gray-600/30">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => 
                    editor.isActive('heading', { level })
                      ? editor.chain().focus().setParagraph().run()
                      : editor.chain().focus().setHeading({ level }).run()
                  }
                  className={getButtonClass(editor.isActive('heading', { level }))}
                  title={`Heading ${level}`}
                >
                  <span className="text-sm font-bold">H{level}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600/20 text-sm">
          <div className="flex items-center space-x-4 text-gray-400">
            <span>{wordCount} words</span>
            <span>{editor.getText().length} characters</span>
          </div>
          <div className="text-xs text-gray-500">
            Press Ctrl+B for bold, Ctrl+I for italic, Ctrl+U for underline
          </div>
        </div>
      </div>

      {/* Scrollable Editor Content */}
      <div className="flex-1 bg-gray-800/40 backdrop-blur-sm overflow-hidden">
        <EditorContent 
          editor={editor} 
          className="h-full min-h-[280px] overflow-y-auto text-white p-2"
        />
      </div>

      {/* Custom Styles for Editor Content */}
      <style jsx global>{`
        .ProseMirror {
          outline: none;
          color: white;
        }
        .ProseMirror p {
          margin: 8px 0;
          color: inherit !important;
        }
        .ProseMirror h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 12px 0 8px 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 12px 0 8px 0;
        }
        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 12px 0 8px 0;
        }
        .ProseMirror strong {
          font-weight: bold;
        }
        .ProseMirror em {
          font-style: italic;
        }
        .ProseMirror u {
          text-decoration: underline;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 24px;
          margin: 12px 0;
        }
        .ProseMirror ul {
          list-style-type: disc;
        }
        .ProseMirror ol {
          list-style-type: decimal;
        }
        .ProseMirror li {
          margin: 4px 0;
          display: list-item;
        }
        .ProseMirror ul li::marker {
          color: #fb923c;
          font-size: 1.2em;
        }
        .ProseMirror ol li::marker {
          color: #fb923c;
          font-weight: bold;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #f97316 !important;
          padding-left: 16px !important;
          margin: 16px 0 !important;
          color: white !important;
          background-color: rgba(249, 115, 22, 0.1) !important;
          border-radius: 0 8px 8px 0 !important;
        }
        /* Override inline blockquote styles for editor display only */
        .ProseMirror blockquote[style] {
          background-color: rgba(249, 115, 22, 0.1) !important;
          color: white !important;
        }
        .ProseMirror a {
          color: #fb923c !important;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #fdba74 !important;
        }
        /* Override link color only for editor display */
        .ProseMirror a[style*="color: #0066cc"] {
          color: #fb923c !important;
        }
      `}</style>
    </div>
  );
};

export default Tiptap;
