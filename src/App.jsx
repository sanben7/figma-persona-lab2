import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Canvas from './components/Canvas';
import AnalysisPanel from './components/AnalysisPanel';
import SettingsModal from './components/SettingsModal';
import { Settings } from 'lucide-react';

const DEFAULT_PERSONAS = [
    {
        id: 'ux-researcher',
        name: 'Senior UX Researcher',
        role: 'A Senior UX Researcher who focuses on heuristics, usability principles, and user flows. Evaluates interfaces based on Nielsen\'s heuristics and cognitive load theory.',
    },
    {
        id: 'grandma',
        name: 'Grandma Ruth (72yo)',
        role: 'A 72-year-old grandmother who struggles with small fonts and complex interfaces. Focuses on clarity, font size, readability, and straightforward navigation.',
    },
    {
        id: 'accessibility',
        name: 'The Accessibility Advocate',
        role: 'An accessibility expert who focuses on WCAG compliance, color contrast ratios, touch target sizes, keyboard navigation, and screen reader compatibility.',
    },
    {
        id: 'gen-z',
        name: 'Gen Z Trendsetter',
        role: 'A 22-year-old design-savvy Gen Z user who cares about aesthetics, modern design trends, dark mode support, and overall vibes of the interface.',
    },
];

function App() {
    const [personas, setPersonas] = useState(DEFAULT_PERSONAS);
    const [selectedPersona, setSelectedPersona] = useState(DEFAULT_PERSONAS[0]);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [analysisResults, setAnalysisResults] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [hoveredIssueId, setHoveredIssueId] = useState(null);
    const [selectedLanguage, setSelectedLanguage] = useState('en'); // 'en' or 'he'
    const [analysisHistory, setAnalysisHistory] = useState([]);

    // Load history from localStorage on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('analysis_history');
        if (savedHistory) {
            try {
                setAnalysisHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Failed to load history:', error);
            }
        }
    }, []);

    // Save analysis to history
    const saveToHistory = (results, personaName, image) => {
        const historyItem = {
            id: Date.now(),
            date: new Date().toISOString(),
            personaName,
            results,
            // Store thumbnail or small image (limit size)
            imageThumbnail: image ? image.substring(0, 50000) : null, // Limit to ~50KB
        };

        const newHistory = [historyItem, ...analysisHistory].slice(0, 10); // Keep last 10
        setAnalysisHistory(newHistory);
        localStorage.setItem('analysis_history', JSON.stringify(newHistory));
    };

    // Load a history item
    const loadHistoryItem = (item) => {
        setAnalysisResults(item.results);
        if (item.imageThumbnail) {
            setUploadedImage(item.imageThumbnail);
        }
    };

    const addCustomPersona = (name, role) => {
        const newPersona = {
            id: `custom-${Date.now()}`,
            name,
            role,
        };
        setPersonas([...personas, newPersona]);
        setSelectedPersona(newPersona);
    };

    const handleImageUpload = (imageDataUrl) => {
        setUploadedImage(imageDataUrl);
        setAnalysisResults(null); // Clear previous results
    };

    const startAnalysis = async () => {
        const apiKey = localStorage.getItem('gemini_api_key');

        if (!apiKey) {
            alert('Please set your Google Gemini API key in Settings');
            setShowSettings(true);
            return;
        }

        if (!uploadedImage) {
            alert('Please upload an image first');
            return;
        }

        setIsAnalyzing(true);
        setAnalysisResults(null);

        try {
            // Convert base64 image to clean format (remove data:image prefix)
            const base64Data = uploadedImage.split(',')[1];
            const mimeType = uploadedImage.split(';')[0].split(':')[1];

            const systemPrompt = `You are a Senior Product Designer acting as the persona: ${selectedPersona.role}.
Analyze the attached UI screenshot.
Scan from Top-Left to Bottom-Right.
Identify 3-5 critical usability, accessibility, or visual issues.

IMPORTANT: Provide ALL text content in BOTH English and Hebrew.

RETURN ONLY VALID JSON (Do not use Markdown code blocks). Structure:
{
  "issues": [
    {
      "id": 1,
      "title": {
        "en": "Short Title in English",
        "he": "כותרת קצרה בעברית"
      },
      "description": {
        "en": "Why is this an issue in English?",
        "he": "למה זו בעיה בעברית?"
      },
      "severity": "Critical" | "Major" | "Minor",
      "fix": {
        "en": "Actionable advice in English",
        "he": "עצה מעשית בעברית"
      },
      "coordinates": { "x": 50, "y": 50 }
    }
  ]
}

The coordinates should be percentages (0-100) relative to the image dimensions, where x=0 is left edge, x=100 is right edge, y=0 is top edge, y=100 is bottom edge.`;

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
                                    { text: systemPrompt },
                                    {
                                        inline_data: {
                                            mime_type: mimeType,
                                            data: base64Data,
                                        },
                                    },
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

            // Clean the response - remove markdown code blocks if present
            let cleanedResponse = textResponse.trim();
            if (cleanedResponse.startsWith('```json')) {
                cleanedResponse = cleanedResponse.replace(/```json\n?/, '').replace(/```$/, '');
            } else if (cleanedResponse.startsWith('```')) {
                cleanedResponse = cleanedResponse.replace(/```\n?/, '').replace(/```$/, '');
            }

            const parsedResults = JSON.parse(cleanedResponse);
            setAnalysisResults(parsedResults);

            // Save to history
            saveToHistory(parsedResults, selectedPersona.name, uploadedImage);
        } catch (error) {
            console.error('Analysis error:', error);
            alert(`Analysis failed: ${error.message}`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Figma Persona Lab</h1>
                    <p className="text-sm text-gray-500">AI-Powered UX Feedback</p>
                </div>
                <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Settings"
                >
                    <Settings className="w-5 h-5 text-gray-600" />
                </button>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    personas={personas}
                    selectedPersona={selectedPersona}
                    onSelectPersona={setSelectedPersona}
                    onAddCustomPersona={addCustomPersona}
                />

                {/* Canvas */}
                <Canvas
                    uploadedImage={uploadedImage}
                    onImageUpload={handleImageUpload}
                    analysisResults={analysisResults}
                    onStartAnalysis={startAnalysis}
                    isAnalyzing={isAnalyzing}
                    hoveredIssueId={hoveredIssueId}
                    onHoverIssue={setHoveredIssueId}
                />

                {/* Analysis Panel */}
                <AnalysisPanel
                    analysisResults={analysisResults}
                    selectedPersona={selectedPersona}
                    hoveredIssueId={hoveredIssueId}
                    onHoverIssue={setHoveredIssueId}
                    selectedLanguage={selectedLanguage}
                    onLanguageChange={setSelectedLanguage}
                    analysisHistory={analysisHistory}
                    onLoadHistory={loadHistoryItem}
                />
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}
        </div>
    );
}

export default App;
