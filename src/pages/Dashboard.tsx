import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { FileText, Calendar, Clock, ArrowRight, Plus, Search, Tag } from 'lucide-react';

export function Dashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const meetings = useLiveQuery(() => db.meetings.orderBy('createdAt').reverse().toArray());

    const filteredMeetings = meetings?.filter(m => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const titleMatch = m.title.toLowerCase().includes(query);
        const tagMatch = m.tags?.some(t => t.toLowerCase().includes(query));
        return titleMatch || tagMatch;
    });

    if (!meetings) return <div className="p-12 text-slate-400">Loading your workspace...</div>;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <header className="mb-10 flex flex-col gap-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Dashboard</h1>
                        <p className="text-slate-500 text-lg">Welcome back. Here are your recent sessions.</p>
                    </div>
                    <Link
                        to="/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2 hover:-translate-y-0.5"
                    >
                        <Plus size={20} />
                        New Meeting
                    </Link>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by title or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm text-slate-700"
                    />
                </div>
            </header>

            {meetings.length === 0 ? (
                <div className="text-center py-32 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-200 border-dashed">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-500">
                        <FileText size={40} />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">No meetings recorded</h3>
                    <p className="text-slate-500 max-w-md mx-auto mb-8">
                        Start a new meeting to capture notes, audio, and visual context. AI will generate the minutes for you.
                    </p>
                    <Link
                        to="/new"
                        className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center justify-center gap-2"
                    >
                        Start your first meeting <ArrowRight size={16} />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMeetings?.map(meeting => (
                        <Link
                            key={meeting.id}
                            to={`/meeting/${meeting.id}`}
                            className="group bg-white p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-900/5 transition-all duration-300 flex flex-col h-full"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    <FileText size={20} />
                                </div>
                                {meeting.minutes && (
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                                        Processed
                                    </span>
                                )}
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {meeting.title || 'Untitled Session'}
                            </h3>

                            <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-1">
                                {meeting.notes || 'No notes taken yet...'}
                            </p>

                            {/* Tags */}
                            {meeting.tags && meeting.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    {meeting.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200 flex items-center gap-1">
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                    {meeting.tags.length > 3 && (
                                        <span className="text-[10px] px-2 py-0.5 bg-slate-50 text-slate-400 rounded-full">
                                            +{meeting.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-xs text-slate-400 border-t border-slate-100 pt-4 mt-auto">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {format(meeting.date, 'MMM d')}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {format(meeting.date, 'h:mm a')}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
