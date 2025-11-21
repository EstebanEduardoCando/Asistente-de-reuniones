interface NoteEditorProps {
    value: string;
    onChange: (value: string) => void;
}

export function NoteEditor({ value, onChange }: NoteEditorProps) {
    return (
        <div className="h-full flex flex-col bg-white">
            <textarea
                className="flex-1 w-full p-8 resize-none focus:outline-none text-lg leading-relaxed text-slate-800 placeholder-slate-300 font-normal"
                placeholder="# Meeting Notes
        
Start typing here... Use Markdown for formatting.
- Key point 1
- Key point 2"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    );
}
