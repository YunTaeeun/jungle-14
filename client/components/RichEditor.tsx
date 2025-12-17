'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Extension } from '@tiptap/core';
import { Bold, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useState } from 'react';

const FONTS = [
    { name: '기본', value: '' },
    { name: '국립박물관클래식', value: 'MuseumClassic' },
    { name: 'HS봄바람', value: 'HSBombaram' },
    { name: '이사만루', value: 'EsamanruMedium' },
    { name: '산하엽', value: 'Diphylleia' },
    { name: '마루부리', value: 'MaruBuri' },
    { name: '오르빗', value: 'Orbit' },
    { name: '구름산스', value: 'GoormSans' },
    { name: '나눔고딕', value: 'NanumGothic' },
    { name: '아리따부리', value: 'AritaBuri' },
];

const SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px'];

interface RichEditorProps {
    content: string;
    onChange: (html: string) => void;
}

// Custom extension for font size
const FontSize = Extension.create({
    name: 'fontSize',
    addGlobalAttributes() {
        return [
            {
                types: ['textStyle'],
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: (element) => {
                            if (element instanceof HTMLElement) {
                                return element.style.fontSize || null;
                            }
                            return null;
                        },
                        renderHTML: attributes => {
                            if (!attributes.fontSize) {
                                return {};
                            }
                            return {
                                style: `font-size: ${attributes.fontSize}`,
                            };
                        },
                    },
                },
            },
        ];
    },
});

export default function RichEditor({ content, onChange }: RichEditorProps) {
    const [selectedFont, setSelectedFont] = useState('');
    const [selectedSize, setSelectedSize] = useState('');

    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            TextStyle,
            FontFamily.configure({
                types: ['textStyle'],
            }),
            FontSize,
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());

            // 현재 커서 위치의 스타일 읽기
            const attrs = editor.getAttributes('textStyle');
            setSelectedFont(attrs.fontFamily || '');
            setSelectedSize(attrs.fontSize || '');
        },
        onSelectionUpdate: ({ editor }) => {
            // 선택 변경 시에도 업데이트
            const attrs = editor.getAttributes('textStyle');
            setSelectedFont(attrs.fontFamily || '');
            setSelectedSize(attrs.fontSize || '');
        },
        editorProps: {
            attributes: {
                class: 'min-h-[400px] outline-none [&_p]:my-4 [&_p]:leading-relaxed',
            },
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* 툴바 */}
            <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-300">
                {/* 폰트 선택 */}
                <select
                    value={selectedFont}
                    onChange={(e) => {
                        const fontValue = e.target.value || null;
                        setSelectedFont(fontValue || '');
                        if (fontValue) {
                            editor.chain().focus().setFontFamily(fontValue).run();
                        } else {
                            editor.chain().focus().unsetFontFamily().run();
                        }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                    aria-label="폰트 선택"
                >
                    {FONTS.map((font) => (
                        <option key={font.value} value={font.value}>
                            {font.name}
                        </option>
                    ))}
                </select>

                {/* 폰트 사이즈 */}
                <select
                    value={selectedSize}
                    onChange={(e) => {
                        const size = e.target.value;
                        setSelectedSize(size);
                        if (size) {
                            editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
                        } else {
                            // fontSize만 제거, fontFamily는 유지
                            editor.chain().focus().setMark('textStyle', { fontSize: null }).run();
                        }
                    }}
                    className="px-3 py-1 border border-gray-300 rounded text-sm"
                    aria-label="폰트 크기 선택"
                >
                    <option value="">크기</option>
                    {SIZES.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>

                {/* 볼드 */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-2 border border-gray-300 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-gray-200' : ''
                        }`}
                    aria-label="볼드 적용"
                    aria-pressed={editor.isActive('bold')}
                >
                    <Bold size={18} />
                </button>

                {/* 정렬 */}
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={`p-2 border border-gray-300 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-200' : ''
                        }`}
                    aria-label="왼쪽 정렬"
                    aria-pressed={editor.isActive({ textAlign: 'left' })}
                >
                    <AlignLeft size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={`p-2 border border-gray-300 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-200' : ''
                        }`}
                    aria-label="가운데 정렬"
                    aria-pressed={editor.isActive({ textAlign: 'center' })}
                >
                    <AlignCenter size={18} />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={`p-2 border border-gray-300 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-200' : ''
                        }`}
                    aria-label="오른쪽 정렬"
                    aria-pressed={editor.isActive({ textAlign: 'right' })}
                >
                    <AlignRight size={18} />
                </button>
            </div>

            {/* 에디터 */}
            <EditorContent editor={editor} />
        </div>
    );
}
