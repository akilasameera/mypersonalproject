import React, { useState } from 'react';
import { Upload, Brain, CheckSquare, Calendar, AlertCircle, X, Edit, Plus, Wand2, FolderOpen } from 'lucide-react';

interface ExtractedTask {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  priority: 'low' | 'medium' | 'high';
  confidence: number;
  selectedProjectId?: string;
}

interface ImageTaskExtractorProps {
  projectId: string;
  projects: any[];
  selectedProjectFilter: string;
  onTasksExtracted: (tasks: ExtractedTask[]) => void;
  onClose: () => void;
}

const ImageTaskExtractor: React.FC<ImageTaskExtractorProps> = ({
  projectId,
  projects,
  selectedProjectFilter,
  onTasksExtracted,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [pasteIndicator, setPasteIndicator] = useState(false);
  const [selectedProjectForAll, setSelectedProjectForAll] = useState(projects[0]?.id || '');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');

  const availableModels = [
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Recommended)', description: 'Best for image analysis and task extraction' },
    { id: 'openai/gpt-4o', name: 'GPT-4 Vision', description: 'Best for complex layouts' },
    { id: 'google/gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Fast and accurate' },
    { id: 'meta-llama/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 Vision', description: 'Open source option' }
  ];

  // Handle paste events for clipboard images
  React.useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Check if the item is an image
        if (item.type.indexOf('image') !== -1) {
          e.preventDefault();
          
          const file = item.getAsFile();
          if (file) {
            // Generate a meaningful filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = file.type.split('/')[1] || 'png';
            const filename = `pasted-image-${timestamp}.${extension}`;
            
            // Create a new File object with a proper name
            const namedFile = new File([file], filename, { type: file.type });
            
            setSelectedFile(namedFile);
            const url = URL.createObjectURL(namedFile);
            setPreviewUrl(url);
            setShowResults(false);
            setExtractedTasks([]);
            
            // Show paste indicator briefly
            setPasteIndicator(true);
            setTimeout(() => setPasteIndicator(false), 2000);
          }
          break;
        }
      }
    };

    // Add event listener
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, []);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowResults(false);
      setExtractedTasks([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setShowResults(false);
      setExtractedTasks([]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:image/jpeg;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const extractTasksFromImage = async () => {
    if (!selectedFile) return;

    // Check if API key is configured
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      alert('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
      return;
    }

    setIsProcessing(true);

    try {
      const base64Image = await convertImageToBase64(selectedFile);

      const prompt = `You are an expert project manager analyzing a project image. Extract ALL visible tasks, schedules, or to-do items from this image.

Look for:
- Task names/titles (any text that looks like a task or activity)
- Date columns (Start Date, End Date, Due Date, Planned Start, Planned Finish, etc.)
- Priority indicators (High, Medium, Low, or color coding)
- Status information (Complete, In Progress, Not Started, etc.)
- Timeline information (Gantt charts, calendars, schedules)
- Any numbered or bulleted lists that look like tasks

IMPORTANT: Be very thorough - extract EVERY task you can see, even if some information is missing.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "title": "Task name",
    "description": "Brief description if available",
    "startDate": "YYYY-MM-DD or null",
    "endDate": "YYYY-MM-DD or null", 
    "priority": "high|medium|low",
    "confidence": 0.95
  }
]

Rules:
- Extract ALL visible tasks, don't skip any
- For dates: convert any format to YYYY-MM-DD (e.g., "Jan 15" becomes "2024-01-15")
- If you see date ranges like "Jan 1 - Jan 15", use Jan 1 as startDate and Jan 15 as endDate
- If only one date is visible, use it as endDate and leave startDate as null
- Confidence should reflect how certain you are about the task extraction (0.0 to 1.0)
- Return ONLY the JSON array, no explanatory text before or after`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Project Manager - Task Extraction'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ],
          max_tokens: 2000,
          temperature: 0.1
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid OpenRouter API key. Please check your VITE_OPENROUTER_API_KEY in the .env file.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status === 402) {
          throw new Error('Insufficient credits. Please check your OpenRouter account balance.');
        } else {
          throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
        }
      }

      const result = await response.json();
      const content = result.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from AI');
      }

      // Parse JSON response
      let tasks: ExtractedTask[];
      try {
        // Extract JSON from response (in case there's extra text)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;
        tasks = JSON.parse(jsonString);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      if (!Array.isArray(tasks)) {
        throw new Error('Invalid response format from AI');
      }

      setExtractedTasks(tasks);
      setShowResults(true);
      
    } catch (error) {
      console.error('Error extracting tasks:', error);
      alert(`Failed to extract tasks: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTaskEdit = (index: number, field: keyof ExtractedTask, value: any) => {
    const updatedTasks = [...extractedTasks];
    updatedTasks[index] = { ...updatedTasks[index], [field]: value };
    setExtractedTasks(updatedTasks);
  };

  const handleRemoveTask = (index: number) => {
    const updatedTasks = extractedTasks.filter((_, i) => i !== index);
    setExtractedTasks(updatedTasks);
  };

  const handleCreateTasks = () => {
    if (!selectedProjectForAll) {
      alert('Please select a project for the tasks.');
      return;
    }

    // Add the selected project to all tasks
    const tasksWithProject = extractedTasks.map(task => ({
      ...task,
      selectedProjectId: selectedProjectForAll
    }));

    onTasksExtracted(tasksWithProject);
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent">
                AI Task Extraction
              </h2>
              <p className="text-gray-600">Upload an image to automatically extract tasks and dates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6 max-h-[calc(95vh-120px)] overflow-y-auto">
          {!showResults ? (
            <div className="space-y-6">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  AI Model Selection
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableModels.map(model => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        selectedModel === model.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900">{model.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload Project Image {pasteIndicator && <span className="text-green-600 font-medium">📋 Image pasted!</span>}
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 bg-gradient-to-br ${
                    pasteIndicator 
                      ? 'border-green-400 from-green-50 to-green-100' 
                      : 'border-gray-300 hover:border-blue-400 from-gray-50 to-gray-100'
                  }`}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-full max-h-64 mx-auto rounded-xl shadow-lg"
                      />
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setPreviewUrl(null);
                          }}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                        <button
                          onClick={extractTasksFromImage}
                          disabled={isProcessing}
                          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center space-x-2"
                        >
                          {isProcessing ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              <span>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-5 h-5" />
                              <span>Extract Tasks</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          Drop an image here, click to upload, or press Ctrl+V to paste
                        </p>
                        <p className="text-gray-500">
                          Supports project plans, Gantt charts, task lists, calendars, and more
                        </p>
                        <div className="mt-4 text-sm text-blue-600 font-medium">
                          💡 Tip: Copy any image and press Ctrl+V to paste it directly!
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckSquare className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Extracted {extractedTasks.length} Tasks
                    </h3>
                    <p className="text-gray-600">Review and edit before creating</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Back to Upload
                </button>
              </div>

              {/* Extracted Tasks List */}
              <div className="space-y-6">
                {/* Single Project Selection for All Tasks */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Select Project for All Tasks</h4>
                      <p className="text-sm text-gray-600">All {extractedTasks.length} tasks will be added to this project</p>
                    </div>
                  </div>
                  <select
                    value={selectedProjectForAll}
                    onChange={(e) => setSelectedProjectForAll(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-base font-medium"
                  >
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tasks List */}
                <div className="space-y-4 max-h-96 overflow-y-auto">
                {extractedTasks.map((task, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`w-3 h-3 rounded-full ${getConfidenceColor(task.confidence)}`} />
                        <span className="text-sm font-medium text-gray-600">
                          {Math.round(task.confidence * 100)}% confidence
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveTask(index)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => handleTaskEdit(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select
                          value={task.priority}
                          onChange={(e) => handleTaskEdit(index, 'priority', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          value={task.startDate || ''}
                          onChange={(e) => handleTaskEdit(index, 'startDate', e.target.value || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          value={task.endDate || ''}
                          onChange={(e) => handleTaskEdit(index, 'endDate', e.target.value || undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                          value={task.description || ''}
                          onChange={(e) => handleTaskEdit(index, 'description', e.target.value || undefined)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="Optional description"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                        {task.priority} priority
                      </span>
                      {(task.startDate || task.endDate) && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {task.startDate && task.endDate 
                              ? `${task.startDate} → ${task.endDate}`
                              : task.startDate 
                                ? `Starts ${task.startDate}`
                                : `Due ${task.endDate}`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-6 border-t border-gray-200">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTasks}
                  disabled={extractedTasks.length === 0}
                  className="flex-1 px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl font-semibold transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create {extractedTasks.length} Tasks</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageTaskExtractor;