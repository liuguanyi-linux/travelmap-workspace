import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomToolbar = ({ id }: { id: string }) => (
  <div id={id} className="custom-quill-toolbar">
    <span className="ql-formats">
      <select className="ql-header" defaultValue="" onChange={e => e.persist()}>
        <option value="1">标题 1</option>
        <option value="2">标题 2</option>
        <option value="">正文</option>
      </select>
      <select className="ql-size" defaultValue="" onChange={e => e.persist()}>
        <option value="small">小号</option>
        <option value="">默认</option>
        <option value="large">大号</option>
        <option value="huge">超大</option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-bold" title="加粗" />
      <button className="ql-italic" title="斜体" />
      <button className="ql-underline" title="下划线" />
      <button className="ql-strike" title="删除线" />
      <button className="ql-blockquote" title="引用" />
    </span>
    <span className="ql-formats">
      <select className="ql-color" title="字体颜色">
        <option selected></option>
        <option value="#e60000"></option>
        <option value="#ff9900"></option>
        <option value="#ffff00"></option>
        <option value="#008a00"></option>
        <option value="#0066cc"></option>
        <option value="#9933ff"></option>
        <option value="#ffffff"></option>
        <option value="#facccc"></option>
        <option value="#ffebcc"></option>
        <option value="#ffffcc"></option>
        <option value="#cce8cc"></option>
        <option value="#cce0f5"></option>
        <option value="#ebd6ff"></option>
        <option value="#bbbbbb"></option>
        <option value="#f06666"></option>
        <option value="#ffc266"></option>
        <option value="#ffff66"></option>
        <option value="#66b966"></option>
        <option value="#66a3e0"></option>
        <option value="#c285ff"></option>
        <option value="#888888"></option>
        <option value="#a10000"></option>
        <option value="#b26b00"></option>
        <option value="#b2b200"></option>
        <option value="#006100"></option>
        <option value="#0047b2"></option>
        <option value="#6b24b2"></option>
        <option value="#444444"></option>
        <option value="#5c0000"></option>
        <option value="#663d00"></option>
        <option value="#666600"></option>
        <option value="#003700"></option>
        <option value="#002966"></option>
        <option value="#3d1466"></option>
      </select>
      <select className="ql-background" title="背景颜色">
        <option selected></option>
        <option value="#e60000"></option>
        <option value="#ff9900"></option>
        <option value="#ffff00"></option>
        <option value="#008a00"></option>
        <option value="#0066cc"></option>
        <option value="#9933ff"></option>
        <option value="#ffffff"></option>
        <option value="#facccc"></option>
        <option value="#ffebcc"></option>
        <option value="#ffffcc"></option>
        <option value="#cce8cc"></option>
        <option value="#cce0f5"></option>
        <option value="#ebd6ff"></option>
        <option value="#bbbbbb"></option>
        <option value="#f06666"></option>
        <option value="#ffc266"></option>
        <option value="#ffff66"></option>
        <option value="#66b966"></option>
        <option value="#66a3e0"></option>
        <option value="#c285ff"></option>
        <option value="#888888"></option>
        <option value="#a10000"></option>
        <option value="#b26b00"></option>
        <option value="#b2b200"></option>
        <option value="#006100"></option>
        <option value="#0047b2"></option>
        <option value="#6b24b2"></option>
        <option value="#444444"></option>
        <option value="#5c0000"></option>
        <option value="#663d00"></option>
        <option value="#666600"></option>
        <option value="#003700"></option>
        <option value="#002966"></option>
        <option value="#3d1466"></option>
      </select>
    </span>
    <span className="ql-formats">
      <button className="ql-list" value="ordered" title="有序列表" />
      <button className="ql-list" value="bullet" title="无序列表" />
      <button className="ql-indent" value="-1" title="减少缩进" />
      <button className="ql-indent" value="+1" title="增加缩进" />
    </span>
    <span className="ql-formats">
      <button className="ql-direction" value="rtl" title="文字方向" />
      <select className="ql-align" title="对齐方式" />
    </span>
    <span className="ql-formats">
      <button className="ql-link" title="插入链接" />
      <button className="ql-image" title="插入图片" />
      <button className="ql-video" title="插入视频" />
    </span>
    <span className="ql-formats">
      <button className="ql-clean" title="清除格式" />
    </span>
  </div>
);

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const toolbarId = React.useMemo(() => `toolbar-${Math.random().toString(36).substring(2, 9)}`, []);

  const modules = {
    toolbar: {
      container: `#${toolbarId}`,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align', 'direction'
  ];

  return (
    <div className="rich-text-editor">
      <CustomToolbar id={toolbarId} />
      <ReactQuill 
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="bg-white rounded-lg"
      />
      <style>{`
        .ql-container {
          min-height: 200px;
          font-size: 16px;
        }
        .ql-editor {
          min-height: 200px;
        }
        /* Fix toolbar spacing */
        .custom-quill-toolbar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
        }
        .ql-toolbar.ql-snow {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
        }
        .ql-container.ql-snow {
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
