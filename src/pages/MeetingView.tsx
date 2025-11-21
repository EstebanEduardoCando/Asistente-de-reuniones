import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type Meeting } from '../db/db';
import { NoteEditor } from '../features/editor/NoteEditor';
import { VisualContext } from '../features/attachments/VisualContext';
import { ArrowLeft, Wand2, CheckCircle2, Tag as TagIcon, Plus, X, Edit3, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";

export function MeetingView({ isNew }: { isNew?: boolean }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [notes, setNotes] = useState('');
    const [meetingId, setMeetingId] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [activeTab, setActiveTab] = useState<'notes' | 'minutes'>('notes');
    const [minutes, setMinutes] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');
    const [isEditingMinutes, setIsEditingMinutes] = useState(false);

    // Load existing meeting
    useEffect(() => {
        if (!isNew && id) {
            const mid = parseInt(id);
            setMeetingId(mid);
            db.meetings.get(mid).then(m => {
                if (m) {
                    setTitle(m.title);
                    setNotes(m.notes);
                    setMinutes(m.minutes || '');
                    setTags(m.tags || []);
                }
            });
        } else if (isNew && !meetingId) {
            const newMeeting: Meeting = {
                title: '',
                date: new Date(),
                notes: '',
                minutes: '',
                tags: [],
                createdAt: new Date(),
                updatedAt: new Date()
            };
            db.meetings.add(newMeeting).then(id => {
                setMeetingId(id as number);
                navigate(`/meeting/${id}`, { replace: true });
            });
        }
    }, [id, isNew, navigate, meetingId]);

    // Auto-save notes
    const handleNoteChange = useCallback((val: string) => {
        setNotes(val);
        if (meetingId) {
            db.meetings.update(meetingId, { notes: val, updatedAt: new Date() });
            setLastSaved(new Date());
        }
    }, [meetingId]);

    // Auto-save minutes
    const handleMinutesChange = useCallback((val: string) => {
        setMinutes(val);
        if (meetingId) {
            db.meetings.update(meetingId, { minutes: val, updatedAt: new Date() });
            setLastSaved(new Date());
        }
    }, [meetingId]);

    const handleTitleChange = useCallback((val: string) => {
        setTitle(val);
        if (meetingId) {
            db.meetings.update(meetingId, { title: val, updatedAt: new Date() });
            setLastSaved(new Date());
        }
    }, [meetingId]);

    // Tag Management
    const handleAddTag = useCallback(() => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            const updatedTags = [...tags, newTag.trim()];
            setTags(updatedTags);
            setNewTag('');
            if (meetingId) {
                db.meetings.update(meetingId, { tags: updatedTags, updatedAt: new Date() });
                setLastSaved(new Date());
            }
        }
    }, [newTag, tags, meetingId]);

    const handleRemoveTag = useCallback((tagToRemove: string) => {
        const updatedTags = tags.filter(t => t !== tagToRemove);
        setTags(updatedTags);
        if (meetingId) {
            db.meetings.update(meetingId, { tags: updatedTags, updatedAt: new Date() });
            setLastSaved(new Date());
        }
    }, [tags, meetingId]);

    // Images
    const images = useLiveQuery(
        () => meetingId ? db.images.where('meetingId').equals(meetingId).toArray() : [],
        [meetingId]
    );

    const handleAddImage = useCallback(async (blob: Blob) => {
        if (!meetingId) return;
        await db.images.add({
            meetingId,
            blob,
            mimeType: blob.type,
            name: 'image.png',
            createdAt: new Date()
        });
    }, [meetingId]);

    const handleRemoveImage = useCallback(async (imgId: number) => {
        await db.images.delete(imgId);
    }, []);

    // AI Generation
    const handleGenerateMinutes = async () => {
        if (!meetingId || !notes) return;

        setIsGenerating(true);
        try {
            const currentImages = await db.images.where('meetingId').equals(meetingId).toArray();
            const imagePayload = currentImages.map(img => ({ blob: img.blob, mimeType: img.mimeType }));

            const { generateMinutes } = await import('../services/gemini');
            const result = await generateMinutes(notes, imagePayload);

            setMinutes(result.minutes);
            setTags(result.tags); // Auto-set tags
            setActiveTab('minutes');
            setIsEditingMinutes(false); // Default to read mode

            await db.meetings.update(meetingId, {
                minutes: result.minutes,
                tags: result.tags,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error(error);
            alert('Error generating minutes: ' + (error as Error).message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!meetingId) return <div className="p-12 text-slate-400">Initializing workspace...</div>;

    return (
        <div className="h-full flex flex-col bg-white">
            {/* Header */}
            <header className="h-auto min-h-16 border-b border-slate-200 flex flex-col justify-center px-6 bg-white shrink-0 z-20 py-2 gap-2">
                <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            onClick={() => navigate('/')}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Untitled Meeting"
                            className="text-lg font-semibold text-slate-900 placeholder-slate-300 focus:outline-none w-full bg-transparent"
                        />
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-lg mx-4">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'notes'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Session Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('minutes')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'minutes'
                                ? 'bg-white text-indigo-600 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            Minutes (Acta)
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full">
                            {lastSaved ? (
                                <>
                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                    Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </>
                            ) : (
                                <span>Unsaved</span>
                            )}
                        </div>
                        <button
                            onClick={handleGenerateMinutes}
                            disabled={isGenerating || !notes}
                            className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shadow-sm ${isGenerating || !notes
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-600/20'
                                }`}
                        >
                            <Wand2 size={16} className={isGenerating ? 'animate-spin' : ''} />
                            {isGenerating ? 'Generating...' : 'Generate Minutes'}
                        </button>
                    </div>
                </div>

                {/* Tags Bar */}
                <div className="flex items-center gap-2 text-sm pb-1">
                    <TagIcon size={14} className="text-slate-400" />
                    <div className="flex flex-wrap gap-2 items-center">
                        {tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100 flex items-center gap-1">
                                {tag}
                                <button onClick={() => handleRemoveTag(tag)} className="hover:text-indigo-900"><X size={12} /></button>
                            </span>
                        ))}
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="Add tag..."
                                className="bg-transparent focus:outline-none text-slate-600 placeholder-slate-400 min-w-[60px]"
                            />
                            <button onClick={handleAddTag} disabled={!newTag} className="text-slate-400 hover:text-indigo-600 disabled:opacity-50">
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {activeTab === 'notes' ? (
                    <>
                        {/* Left: Notes */}
                        <div className="flex-1 overflow-hidden relative">
                            <NoteEditor value={notes} onChange={handleNoteChange} />
                        </div>

                        {/* Right: Visual Context */}
                        <div className="w-96 shrink-0 h-full overflow-hidden shadow-xl shadow-slate-200 z-10">
                            <VisualContext
                                images={images || []}
                                onAddImage={handleAddImage}
                                onRemoveImage={handleRemoveImage}
                            />
                        </div>
                    </>
                ) : (
                    /* Minutes View (Full Width) */
                    <div className="flex-1 overflow-hidden relative bg-slate-50/50 flex flex-col">
                        <div className="max-w-4xl mx-auto w-full h-full shadow-sm bg-white border-x border-slate-100 flex flex-col">
                            {/* Toolbar */}
                            <div className="h-10 border-b border-slate-100 flex items-center justify-end px-4 gap-2 bg-slate-50/30">
                                <button
                                    onClick={() => setIsEditingMinutes(!isEditingMinutes)}
                                    className="text-xs font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-100"
                                >
                                    {isEditingMinutes ? <><Eye size={14} /> Preview Mode</> : <><Edit3 size={14} /> Edit Mode</>}
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-auto">
                                {isEditingMinutes ? (
                                    <div className="h-full overflow-hidden">
                                        <SimpleMDE
                                            value={minutes}
                                            onChange={handleMinutesChange}
                                            options={{
                                                spellChecker: false,
                                                status: false,
                                                placeholder: "Minutes will appear here...",
                                                toolbar: ["bold", "italic", "heading", "|", "quote", "unordered-list", "ordered-list", "|", "link", "image", "|", "preview", "side-by-side", "fullscreen"],
                                            }}
                                            className="h-full [&_.EasyMDEContainer]:h-full [&_.CodeMirror]:h-full [&_.CodeMirror]:border-none [&_.editor-toolbar]:border-none [&_.editor-toolbar]:bg-slate-50 [&_.editor-toolbar]:opacity-80 hover:[&_.editor-toolbar]:opacity-100 transition-opacity"
                                        />
                                    </div>
                                ) : (
                                    <div className="prose prose-slate max-w-none p-12">
                                        {minutes ? (
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{minutes}</ReactMarkdown>
                                        ) : (
                                            <div className="text-slate-300 italic text-center mt-20">
                                                No minutes generated yet. Switch to Notes tab and click "Generate Minutes".
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
