import Dexie, { type EntityTable } from 'dexie';

export interface Meeting {
    id?: number;
    title: string;
    date: Date;
    notes: string; // HTML/Markdown content
    minutes?: string; // Generated minutes
    tags?: string[]; // Auto-generated or manual tags
    createdAt: Date;
    updatedAt: Date;
}

export interface MeetingImage {
    id?: number;
    meetingId: number;
    blob: Blob;
    mimeType: string;
    name: string;
    createdAt: Date;
}

const db = new Dexie('MeetingAssistantDB') as Dexie & {
    meetings: EntityTable<Meeting, 'id'>;
    images: EntityTable<MeetingImage, 'id'>;
};

// Schema definition
db.version(1).stores({
    meetings: '++id, title, date, *tags, createdAt', // *tags for multi-entry index
    images: '++id, meetingId, createdAt'
});

export { db };
