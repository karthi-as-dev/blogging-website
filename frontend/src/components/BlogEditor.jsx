import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Code, Link2, Image as ImageIcon, ImagePlus, Minus, Undo, Redo,
} from 'lucide-react';
import { blogService } from '../services/blogService';
import toast from 'react-hot-toast';

const ToolbarBtn = ({ onClick, active, children, title }) => (
  <button type="button" onClick={onClick} title={title}
    className={`p-2 rounded-lg transition-colors text-sm ${
      active ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
    }`}>
    {children}
  </button>
);

export default function BlogEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false, allowBase64: true }),
      Placeholder.configure({ placeholder: 'Start writing your story...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      try {
        const res = await blogService.uploadImage(file);
        editor.chain().focus().setImage({ src: res.data.url }).run();
      } catch {
        toast.error('Failed to upload image');
      }
    };
    input.click();
  };

  const addImageUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const toolbarGroups = [
    [
      { icon: Bold, action: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold'), title: 'Bold' },
      { icon: Italic, action: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic'), title: 'Italic' },
      { icon: UnderlineIcon, action: () => editor.chain().focus().toggleUnderline().run(), active: editor.isActive('underline'), title: 'Underline' },
      { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(), active: editor.isActive('strike'), title: 'Strikethrough' },
    ],
    [
      { icon: Heading1, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: editor.isActive('heading', { level: 1 }), title: 'Heading 1' },
      { icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive('heading', { level: 2 }), title: 'Heading 2' },
      { icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: editor.isActive('heading', { level: 3 }), title: 'Heading 3' },
    ],
    [
      { icon: List, action: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList'), title: 'Bullet List' },
      { icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive('orderedList'), title: 'Numbered List' },
      { icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive('blockquote'), title: 'Blockquote' },
      { icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), active: editor.isActive('codeBlock'), title: 'Code Block' },
    ],
    [
      { icon: Link2, action: addLink, active: editor.isActive('link'), title: 'Add Link' },
      { icon: ImageIcon, action: addImage, active: false, title: 'Upload Image' },
      { icon: ImagePlus, action: addImageUrl, active: false, title: 'Insert Image URL' },
      { icon: Minus, action: () => editor.chain().focus().setHorizontalRule().run(), active: false, title: 'Divider' },
    ],
    [
      { icon: Undo, action: () => editor.chain().focus().undo().run(), active: false, title: 'Undo' },
      { icon: Redo, action: () => editor.chain().focus().redo().run(), active: false, title: 'Redo' },
    ],
  ];

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-2 flex flex-wrap gap-1 items-center bg-gray-50 dark:bg-gray-800/50">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex gap-1">
            {group.map(({ icon: Icon, action, active, title }) => (
              <ToolbarBtn key={title} onClick={action} active={active} title={title}>
                <Icon size={15} />
              </ToolbarBtn>
            ))}
            {gi < toolbarGroups.length - 1 && <div className="w-px bg-gray-200 dark:bg-gray-700 mx-1 self-stretch" />}
          </div>
        ))}
      </div>

      {/* Editor */}
      <EditorContent editor={editor} className="min-h-[400px] text-gray-900 dark:text-gray-100" />
    </div>
  );
}
