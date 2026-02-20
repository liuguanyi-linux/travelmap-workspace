import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, Link, Type, Minus, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  // Sync value to innerHTML when value changes externally
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      // Only update if significantly different to avoid cursor jumping
      // A simple check is usually not enough for contenteditable, but for this simple use case:
      if (document.activeElement !== editorRef.current) {
         editorRef.current.innerHTML = value || '';
      }
    }
  }, [value]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
    editorRef.current?.focus();
  };

  const ToolbarButton = ({ icon: Icon, command, arg, title }: any) => (
    <button
      type="button"
      onClick={() => execCommand(command, arg)}
      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        <ToolbarButton icon={Bold} command="bold" title="Bold" />
        <ToolbarButton icon={Italic} command="italic" title="Italic" />
        <ToolbarButton icon={Underline} command="underline" title="Underline" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <ToolbarButton icon={Heading1} command="formatBlock" arg="H1" title="Heading 1" />
        <ToolbarButton icon={Heading2} command="formatBlock" arg="H2" title="Heading 2" />
        
        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton icon={AlignLeft} command="justifyLeft" title="Align Left" />
        <ToolbarButton icon={AlignCenter} command="justifyCenter" title="Align Center" />
        <ToolbarButton icon={AlignRight} command="justifyRight" title="Align Right" />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <ToolbarButton icon={List} command="insertUnorderedList" title="Bullet List" />
        <ToolbarButton icon={ListOrdered} command="insertOrderedList" title="Numbered List" />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => {
            const url = prompt('Enter URL:');
            if (url) execCommand('createLink', url);
          }}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
          title="Insert Link"
        >
          <Link size={18} />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <div className="flex items-center gap-1">
             <button 
                type="button"
                onClick={() => execCommand('foreColor', '#000000')}
                className="w-5 h-5 rounded-full bg-black border border-gray-200"
                title="Black"
             />
             <button 
                type="button"
                onClick={() => execCommand('foreColor', '#EF4444')}
                className="w-5 h-5 rounded-full bg-red-500 border border-gray-200"
                title="Red"
             />
             <button 
                type="button"
                onClick={() => execCommand('foreColor', '#3B82F6')}
                className="w-5 h-5 rounded-full bg-blue-500 border border-gray-200"
                title="Blue"
             />
             <button 
                type="button"
                onClick={() => execCommand('foreColor', '#10B981')}
                className="w-5 h-5 rounded-full bg-green-500 border border-gray-200"
                title="Green"
             />
        </div>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="p-4 min-h-[200px] outline-none prose max-w-none text-sm"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{ minHeight: '200px' }}
      />
    </div>
  );
}
