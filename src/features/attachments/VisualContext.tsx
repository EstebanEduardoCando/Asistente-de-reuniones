import { useCallback } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import { type MeetingImage } from '../../db/db';

interface VisualContextProps {
    images: MeetingImage[];
    onAddImage: (blob: Blob) => void;
    onRemoveImage: (id: number) => void;
}

export function VisualContext({ images, onAddImage, onRemoveImage }: VisualContextProps) {
    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.indexOf('image') !== -1) {
                const blob = item.getAsFile();
                if (blob) onAddImage(blob);
            }
        }
    }, [onAddImage]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                onAddImage(file);
            }
        }
    }, [onAddImage]);

    return (
        <div
            className="h-full flex flex-col bg-slate-50 border-l border-slate-200"
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            tabIndex={0}
        >
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <ImageIcon size={18} className="text-indigo-500" />
                    <span>Visual Context</span>
                </div>
                <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">
                    {images.length}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {images.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                            <Upload size={20} className="text-slate-400" />
                        </div>
                        <p className="text-sm font-medium text-slate-600">Drop images here</p>
                        <p className="text-xs text-slate-400 mt-1">or paste (Ctrl+V)</p>
                    </div>
                ) : (
                    images.map((img) => (
                        <div key={img.id} className="relative group bg-white p-2 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                            <img
                                src={URL.createObjectURL(img.blob)}
                                alt="Context"
                                className="w-full h-auto rounded-lg"
                            />
                            <button
                                onClick={() => img.id && onRemoveImage(img.id)}
                                className="absolute top-3 right-3 bg-white/90 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-red-50"
                                title="Remove image"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
