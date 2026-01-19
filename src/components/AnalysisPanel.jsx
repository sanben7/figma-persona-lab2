import { AlertCircle, AlertTriangle, Info, Languages, Clock } from 'lucide-react';

const severityConfig = {
    Critical: {
        color: 'red',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
        borderColor: 'border-red-200',
        icon: AlertCircle,
    },
    Major: {
        color: 'orange',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
        borderColor: 'border-orange-200',
        icon: AlertTriangle,
    },
    Minor: {
        color: 'yellow',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
        borderColor: 'border-yellow-200',
        icon: Info,
    },
};

export default function AnalysisPanel({ analysisResults, selectedPersona, hoveredIssueId, onHoverIssue, selectedLanguage, onLanguageChange, analysisHistory, onLoadHistory }) {
    // Helper function to get text in the selected language
    const getText = (textObj) => {
        if (typeof textObj === 'string') return textObj; // Fallback for non-bilingual responses
        return textObj?.[selectedLanguage] || textObj?.en || textObj?.he || '';
    };
    if (!analysisResults) {
        return (
            <aside className="w-96 bg-white border-l border-gray-200 flex flex-col">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">UX Audit Report</h2>
                    <p className="text-sm text-gray-500 mt-1">Results will appear here</p>
                </div>

                <div className="flex-1 flex items-center justify-center p-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Info className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                            Upload an image and click "Start Analysis" to begin
                        </p>
                    </div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-96 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold text-gray-900">UX Audit Report</h2>

                    {/* Language Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => onLanguageChange('en')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${selectedLanguage === 'en'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            EN
                        </button>
                        <button
                            onClick={() => onLanguageChange('he')}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${selectedLanguage === 'he'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            HE
                        </button>
                    </div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                    Reviewed by: <span className="font-medium text-gray-700">{selectedPersona.name}</span>
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {analysisResults.issues && analysisResults.issues.length > 0 ? (
                    analysisResults.issues.map((issue) => {
                        const config = severityConfig[issue.severity] || severityConfig.Minor;
                        const Icon = config.icon;

                        return (
                            <div
                                key={issue.id}
                                onMouseEnter={() => onHoverIssue(issue.id)}
                                onMouseLeave={() => onHoverIssue(null)}
                                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${hoveredIssueId === issue.id
                                    ? `${config.borderColor} bg-${config.color}-50 shadow-md scale-[1.02]`
                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}
                                    >
                                        <span className={`text-sm font-bold ${config.textColor}`}>{issue.id}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 mb-1">{getText(issue.title)}</h3>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
                                        >
                                            <Icon className="w-3 h-3" />
                                            {issue.severity}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div>
                                        <p className="text-gray-700">{getText(issue.description)}</p>
                                    </div>

                                    <div className="pt-2 border-t border-gray-200">
                                        <p className="font-medium text-gray-900 mb-1">💡 Recommended Fix:</p>
                                        <p className="text-gray-700">{getText(issue.fix)}</p>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-8">
                        <p className="text-sm text-gray-500">No issues found</p>
                    </div>
                )}
            </div>

            {/* History Section */}
            {analysisHistory && analysisHistory.length > 0 && (
                <div className="border-t border-gray-200">
                    <div className="p-4 bg-gray-50">
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-3">
                            <Clock className="w-4 h-4" />
                            Recent Analysis
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {analysisHistory.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => onLoadHistory(item)}
                                    className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-sm"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-medium text-gray-900">{item.personaName}</span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(item.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {item.results.issues?.length || 0} issues found
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
