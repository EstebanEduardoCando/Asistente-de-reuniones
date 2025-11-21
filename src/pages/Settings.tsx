import { useState, useEffect } from 'react';
import { getApiKey, setApiKey } from '../services/gemini';
import { Save, Key } from 'lucide-react';

export function Settings() {
    const [key, setKey] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const stored = getApiKey();
        if (stored) setKey(stored);
    }, []);

    const handleSave = () => {
        setApiKey(key);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Key size={20} className="text-blue-600" />
                    AI Configuration
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Google Gemini API Key
                        </label>
                        <input
                            type="password"
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Required for generating meeting minutes. Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Google AI Studio</a>.
                        </p>
                    </div>

                    <button
                        onClick={handleSave}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                    >
                        <Save size={16} />
                        {saved ? 'Saved!' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}
