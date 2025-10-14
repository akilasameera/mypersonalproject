import React, { useState } from 'react';
import { Plus, Edit, Trash2, MessageSquare, User, Clock, X, Brain, Sparkles } from 'lucide-react';
import type { MeetingTranscript } from '../../types';
import { useMeetings } from '../../hooks/useMeetings';

/**
 * MeetingTranscriptTab (no-redirect + robust JSON parsing + instant updates)
 * - No router navigation or window.location reloads
 * - Hardened AI JSON parsing (handles ```json fences, pre/post text, nested braces)
 * - Emits a window event for live UI updates across tabs (meeting:aiUpdated)
 * - Uses useMeetings(meetingId) (fixes redirect to dashboard)
 */

interface MeetingTranscriptTabProps {
  meetingId: string;
  transcripts: MeetingTranscript[];
  onUpdateTranscripts: (transcripts: MeetingTranscript[]) => void;
  onGenerateSummary?: (summary: any) => Promise<void>;
  onGenerateTodos?: (todos: any[]) => Promise<void>;
  onRefreshAfterAI?: () => void; // optional parent refetch without navigation
}

// ---- Helper: Robust JSON extractor for LLM text ----
function extractJsonFromText(text: string): any {
  if (!text) throw new Error('Empty AI response');

  // 1) Direct JSON
  try { return JSON.parse(text); } catch {}

  // 2) Code fences: ```json ... ``` or ``` ... ```
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fence) {
    try { return JSON.parse(fence[1]); } catch {}
  }

  // 3) First '{' to last '}'
  const first = text.indexOf('{');
  const last  = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    const sliced = text.slice(first, last + 1);
    try { return JSON.parse(sliced); } catch {}
  }

  // 4) Balanced search for a top-level JSON object
  for (let i = 0; i < text.length; i++) {
    if (text[i] !== '{') continue;
    let depth = 0;
    for (let j = i; j < text.length; j++) {
      const ch = text[j];
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const candidate = text.slice(i, j + 1);
          try { return JSON.parse(candidate); } catch {}
        }
      }
    }
  }

  throw new Error('Failed to parse AI response. Please try again.');
}

// ---- Lightweight event emitter so other tabs update instantly ----
function emitAIUpdate(payload: { meetingId: string; summary?: any; todos?: any[] }) {
  window.dispatchEvent(new CustomEvent('meeting:aiUpdated', { detail: payload }));
}

const MeetingTranscriptTab: React.FC<MeetingTranscriptTabProps> = ({
  meetingId,
  transcripts,
  onUpdateTranscripts,
  onGenerateSummary,
  onGenerateTodos,
  onRefreshAfterAI,
}) => {
  // ✅ IMPORTANT: pass the real meetingId (not an empty string)
  const { createTranscript, updateTranscript, deleteTranscript, loading } = useMeetings(meetingId);

  const [showForm, setShowForm] = useState(false);
  const [editingTranscript, setEditingTranscript] = useState<MeetingTranscript | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({ content: '', speaker: '', timestampInMeeting: '' });

  const generateAIContent = async () => {
    if (transcripts.length === 0) {
      alert('Please add at least one transcript before generating AI content.');
      return;
    }

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!apiKey) {
      alert('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const fullTranscript = [...transcripts]
        .sort((a, b) => (a.timestampInMeeting || '').localeCompare(b.timestampInMeeting || ''))
        .map(t => `${t.speaker ? `[${t.speaker}]` : '[Speaker]'} ${t.timestampInMeeting ? `(${t.timestampInMeeting})` : ''}: ${t.content}`)
        .join('\n\n');

      const meetingDate = new Date();
      const defaultDueDate = new Date(meetingDate);
      defaultDueDate.setDate(defaultDueDate.getDate() + 7);
      const defaultDueDateStr = defaultDueDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const systemGuard = 'Return ONLY a valid JSON object. No preface, no code fences, no markdown, no explanations.';

      const prompt = `You are an expert meeting analyst. Analyze this meeting transcript and generate BOTH a comprehensive summary AND actionable todo items.
\nMEETING TRANSCRIPT:\n${fullTranscript}\n\nCRITICAL: You MUST provide BOTH summary AND todos. Return your analysis in this EXACT JSON format:\n\n{
  "summary": {
    "content": "Write a comprehensive 3-4 paragraph summary covering all major topics discussed, decisions made, and outcomes achieved. Include context about participants, main themes, and overall meeting effectiveness.",
    "keyPoints": "• List all key points discussed with specific details\\n• Include actionable insights and important information\\n• Add measurable outcomes and next steps\\n• Cover all major discussion topics",
    "decisions": "• List all decisions made with rationale\\n• Include implementation timelines where mentioned\\n• Note responsible parties for each decision\\n• Add any policy or process changes agreed upon"
  },
  "todos": [
    {
      "title": "Specific action item title",
      "description": "Detailed description with context and requirements",
      "assignedTo": "Person's name from transcript OR 'Team' OR 'TBD'",
      "priority": "high|medium|low",
      "dueDate": "${defaultDueDateStr}"
    }
  ]
}\n\nEXTRACTION RULES:
1. SUMMARY: Always generate a comprehensive summary with content, keyPoints, and decisions
2. TODOS: Extract EVERY actionable item mentioned in the transcript
3. RESPONSIBLE PERSON: Look for names in the transcript. Use exact names if mentioned, "Team" if multiple people, "TBD" if unclear
4. DUE DATES: 
   - If transcript mentions specific dates (like "by Friday", "next Tuesday", "March 15th"), convert to YYYY-MM-DD format
   - If NO specific date mentioned, use "${defaultDueDateStr}" (one week from today)
   - DO NOT guess or estimate dates
5. PRIORITY: Set based on urgency mentioned (urgent/ASAP = high, important = medium, nice-to-have = low)
6. Be thorough - extract ALL action items, even small ones

Return ONLY the JSON object with no additional text before or after.`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Project Manager - Meeting Analysis'
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            { role: 'system', content: systemGuard },
            { role: 'user', content: prompt }
          ],
          max_tokens: 3000,
          temperature: 0
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API response:', errorText);
        if (response.status === 401) throw new Error('Invalid OpenRouter API key.');
        if (response.status === 429) throw new Error('Rate limit exceeded.');
        if (response.status === 402) throw new Error('Insufficient credits.');
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const result = await response.json();
      const rawContent = result?.choices?.[0]?.message?.content;
      const content = Array.isArray(rawContent)
        ? rawContent.map((p: any) => p?.text ?? p?.content ?? '').join('')
        : (rawContent as string | undefined);

      if (!content || typeof content !== 'string') {
        console.error('AI raw content:', rawContent);
        throw new Error('No content received from AI');
      }

      let analysis: { summary: any; todos: any[] };
      try {
        analysis = extractJsonFromText(content.trim());
      } catch (parseError) {
        console.error('JSON parse error:\n', content, parseError);
        throw new Error('Failed to parse AI response. Please try again.');
      }

      if (!analysis.summary || !Array.isArray(analysis.todos)) {
        throw new Error('Invalid response format from AI');
      }

      // Persist via the parent
      if (onGenerateSummary) await onGenerateSummary(analysis.summary);
      if (onGenerateTodos && analysis.todos.length > 0) await onGenerateTodos(analysis.todos);

      // 🔔 Notify the app immediately (no reloads)
      emitAIUpdate({ meetingId, summary: analysis.summary, todos: analysis.todos });

      // Optional: refetch caches AFTER the event; schedule to avoid race with guards
      if (onRefreshAfterAI) setTimeout(() => onRefreshAfterAI(), 0);

      const todoSummary = analysis.todos
        .map(todo => `• ${todo.title} (Assigned: ${todo.assignedTo}) - Due: ${todo.dueDate}`)
        .join('\n');

      alert(`✅ AI Analysis Complete!\n\n📝 Summary: Generated comprehensive meeting summary with key points and decisions\n\n✅ Action Items: Created ${analysis.todos.length} tasks:\n\n${todoSummary}\n\n👉 Check the Summary and Action Items tabs to review.`);
    } catch (error: any) {
      console.error('Error analyzing transcript:', error);
      alert(`Failed to analyze transcript: ${error.message || error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTranscript) {
        const updatedTranscript = await updateTranscript(editingTranscript.id, {
          content: formData.content,
          speaker: formData.speaker,
          timestampInMeeting: formData.timestampInMeeting,
        });
        const updatedTranscripts = transcripts.map(transcript =>
          transcript.id === editingTranscript.id ? { ...transcript, ...updatedTranscript } : transcript
        );
        onUpdateTranscripts(updatedTranscripts);
      } else {
        const newTranscript = await createTranscript(meetingId, {
          content: formData.content,
          speaker: formData.speaker,
          timestampInMeeting: formData.timestampInMeeting,
        });
        onUpdateTranscripts([...transcripts, newTranscript]);
      }
      resetForm();
    } catch (error) {
      console.error('Error saving transcript:', error);
    }
  };

  const handleEdit = (transcript: MeetingTranscript) => {
    setEditingTranscript(transcript);
    setFormData({
      content: transcript.content,
      speaker: transcript.speaker || '',
      timestampInMeeting: transcript.timestampInMeeting || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (transcriptId: string) => {
    if (window.confirm('Are you sure you want to delete this transcript?')) {
      try {
        await deleteTranscript(transcriptId);
        const updatedTranscripts = transcripts.filter(transcript => transcript.id !== transcriptId);
        onUpdateTranscripts(updatedTranscripts);
      } catch (error) {
        console.error('Error deleting transcript:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({ content: '', speaker: '', timestampInMeeting: '' });
    setEditingTranscript(null);
    setShowForm(false);
  };

  const formatDateTime = (dateString: string | number | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Meeting Transcript</h2>
          <p className="text-gray-600 mt-1">Record conversations and generate insights with AI</p>
        </div>
        <div className="flex items-center space-x-3">
          {transcripts.length > 0 && (
            <button
              onClick={generateAIContent}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>AI Analyze</span>
                </>
              )}
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transcript</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Info */}
      {transcripts.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI-Powered Analysis Available</h3>
              <p className="text-sm text-gray-600">
                Click "AI Analyze" to automatically generate meeting summary and action items from your transcripts
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingTranscript ? 'Edit Transcript' : 'Add New Transcript'}
            </h3>
            <button onClick={resetForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Speaker (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.speaker}
                    onChange={(e) => setFormData(prev => ({ ...prev, speaker: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Speaker name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timestamp (Optional)</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.timestampInMeeting}
                    onChange={(e) => setFormData(prev => ({ ...prev, timestampInMeeting: e.target.value }))}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 00:15:30 or 15:30"
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transcript Content</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter the meeting transcript here..."
                required
              />
            </div>
            <div className="flex space-x-3">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors">
                {loading ? 'Saving...' : editingTranscript ? 'Update' : 'Add'} Transcript
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transcripts List */}
      {transcripts.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No transcripts yet</h3>
          <p className="text-gray-500 mb-4">Add your first transcript to record meeting conversations</p>
          <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">Add Transcript</button>
        </div>
      ) : (
        <div className="space-y-4">
          {transcripts.map(transcript => (
            <div key={transcript.id} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    {transcript.speaker && (<h4 className="font-semibold text-gray-900">{transcript.speaker}</h4>)}
                    {transcript.timestampInMeeting && (<p className="text-sm text-gray-600">{transcript.timestampInMeeting}</p>)}
                    <p className="text-xs text-gray-500">Added {formatDateTime((transcript as any).createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => handleEdit(transcript)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(transcript.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{transcript.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MeetingTranscriptTab;
