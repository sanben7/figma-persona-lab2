import { useRef, useState } from 'react';
import { Upload, Play, Loader2 } from 'lucide-react';

export default function Canvas({
    uploadedImage,
    onImageUpload,
    analysisResults,
    onStartAnalysis,
    isAnalyzing,
    hoveredIssueId,
    onHoverIssue,
}) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileSelect = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onImageUpload(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    return (
        <div className="flex-1 flex flex-col bg-gray-100 overflow-hidden">
            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                >
                    <Upload className="w-4 h-4" />
                    Upload Image
                </button>

                {uploadedImage && (
                    <button
                        onClick={onStartAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Play className="w-4 h-4" />
                                Start Analysis
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-8">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                />

                {!uploadedImage ? (
                    // Empty State
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`h-full min-h-[400px] flex items-center justify-center border-2 border-dashed rounded-xl transition-colors ${isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-white hover:border-gray-400'
                            }`}
                    >
                        <div className="text-center">
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Upload Design to Test
                            </h3>
                            <p className="text-sm text-gray-500 mb-4">
                                Drag & drop an image or click to browse
                            </p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                            >
                                Choose File
                            </button>
                        </div>
                    </div>
                ) : (
                    // Image with Overlay
                    <div className="flex items-center justify-center">
                        <div className="relative inline-block max-w-full">
                            <img
                                src={uploadedImage}
                                alt="Uploaded design"
                                className="max-w-full h-auto rounded-lg shadow-lg"
                            />

                            {/* Red Dot Overlay */}
                            {analysisResults?.issues?.map((issue) => (
                                <div
                                    key={issue.id}
                                    onMouseEnter={() => onHoverIssue(issue.id)}
                                    onMouseLeave={() => onHoverIssue(null)}
                                    onClick={() => onHoverIssue(issue.id)}
                                    className="absolute cursor-pointer"
                                    style={{
                                        left: `${issue.coordinates.x}%`,
                                        top: `${issue.coordinates.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}
                                >
                                    <div
                                        className={`w-6 h-6 rounded-full bg-red-500 border-2 border-white shadow-lg pulse-dot ${hoveredIssueId === issue.id ? 'scale-150' : ''
                                            } transition-transform`}
                                    >
                                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                                            {issue.id}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
