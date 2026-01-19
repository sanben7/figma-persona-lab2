import { useState } from 'react';
import { UserCircle, Plus, X, Sparkles, Loader2 } from 'lucide-react';

export default function Sidebar({ personas, selectedPersona, onSelectPersona, onAddCustomPersona }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [newPersonaName, setNewPersonaName] = useState('');
    const [newPersonaRole, setNewPersonaRole] = useState('');
    const [personaKeyword, setPersonaKeyword] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateWithAI = async () => {
        const apiKey = localStorage.getItem('gemini_api_key');

        if (!apiKey) {
            alert('Please set your Google Gemini API key in Settings first');
            return;
        }

        if (!personaKeyword.trim()) {
            alert('Please enter a keyword to generate a persona');
            return;
        }

        setIsGenerating(true);

        try {
            const systemPrompt = `Generate a detailed UX persona for a user described as '${personaKeyword}'. 
This persona will be used to review user interface designs.
Focus on their UX needs, preferences, pain points, and what they look for in interfaces.

RETURN ONLY VALID JSON (Do not use Markdown code blocks). Structure:
{
  "name": "Full persona name with descriptor (e.g., 'Sarah the College Student')",
  "role": "Detailed description of this persona's perspective, UX needs, what they focus on when reviewing interfaces, their pain points, and priorities (2-3 sentences)"
}`;

            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: systemPrompt }
                                ],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'API request failed');
            }

            const data = await response.json();
            const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!textResponse) {
                throw new Error('No response from API');
            }

            // Clean the response
            let cleanedResponse = textResponse.trim();
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```$/, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```$/, '');
            }

            const personaData = JSON.parse(cleanedResponse);

            // Auto-fill the form
            setNewPersonaName(personaData.name || '');
            setNewPersonaRole(personaData.role || '');
            setPersonaKeyword(''); // Clear keyword after successful generation

        } catch (error) {
            console.error('Persona generation error:', error);
            alert(`Failed to generate persona: ${error.message}`);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddPersona = () => {
        if (newPersonaName.trim() && newPersonaRole.trim()) {
            onAddCustomPersona(newPersonaName, newPersonaRole);
            setNewPersonaName('');
            setNewPersonaRole('');
            setShowAddModal(false);
        }
    };

    return (
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Select Persona</h2>
                <p className="text-sm text-gray-500 mt-1">Choose who will review your design</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {personas.map((persona) => (
                    <button
                        key={persona.id}
                        onClick={() => onSelectPersona(persona)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedPersona.id === persona.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            <UserCircle
                                className={`w-6 h-6 flex-shrink-0 ${selectedPersona.id === persona.id ? 'text-blue-600' : 'text-gray-400'
                                    }`}
                            />
                            <div className="flex-1 min-w-0">
                                <h3
                                    className={`font-medium ${selectedPersona.id === persona.id ? 'text-blue-900' : 'text-gray-900'
                                        }`}
                                >
                                    {persona.name}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{persona.role}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <div className="p-4 border-t border-gray-200">
                <button
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Add Custom Persona
                </button>
            </div>

            {/* Add Persona Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Add Custom Persona</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* AI Generation Section */}
                            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                                <label className="block text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    Generate with AI
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={personaKeyword}
                                        onChange={(e) => setPersonaKeyword(e.target.value)}
                                        placeholder="e.g., Student, Angry Boss, Designer"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        onKeyPress={(e) => e.key === 'Enter' && handleGenerateWithAI()}
                                    />
                                    <button
                                        onClick={handleGenerateWithAI}
                                        disabled={isGenerating || !personaKeyword.trim()}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-white text-gray-500">or fill manually</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Persona Name
                                </label>
                                <input
                                    type="text"
                                    value={newPersonaName}
                                    onChange={(e) => setNewPersonaName(e.target.value)}
                                    placeholder="e.g., Tech-Savvy Student"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role Description
                                </label>
                                <textarea
                                    value={newPersonaRole}
                                    onChange={(e) => setNewPersonaRole(e.target.value)}
                                    placeholder="Describe this persona's perspective and what they focus on..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAddPersona}
                                disabled={!newPersonaName.trim() || !newPersonaRole.trim()}
                                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Add Persona
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
