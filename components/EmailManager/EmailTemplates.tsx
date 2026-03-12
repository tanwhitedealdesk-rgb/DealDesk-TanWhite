
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Loader2, CheckCircle, Info, FileCode, Eye, Code } from 'lucide-react';
import { api } from '../../services/api';
import { generateId } from '../../services/utils';

interface EmailTemplate {
    id: string;
    name: string;
    type: string;
    html_content: string;
    is_default: boolean;
    last_updated: string;
}

export const EmailTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<Partial<EmailTemplate> | null>(null);
    const [editorTab, setEditorTab] = useState<'code' | 'preview'>('code');

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const data = await api.load('EmailTemplates');
            if (Array.isArray(data)) {
                setTemplates(data as any);
            } else {
                setTemplates([]);
            }
        } catch (e) {
            console.error("Failed to fetch templates", e);
            setTemplates([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleCreate = () => {
        setEditingTemplate({
            id: generateId(),
            name: '',
            type: 'Marketing',
            html_content: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 40px auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: #1e293b; padding: 24px; color: white; text-align: center; font-weight: bold; font-size: 20px; }
    .content { padding: 40px; color: #334155; line-height: 1.6; }
    .footer { background: #f1f5f9; padding: 20px; color: #64748b; font-size: 12px; text-align: center; border-top: 1px solid #e2e8f0; }
    a { color: #3b82f6; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">AZRE DealDesk</div>
    <div class="content">
      {{ Content }}
    </div>
    <div class="footer">
      <p style="margin: 0 0 10px;">© 2024 Ashari Zakar Real Estate • ATL • GA</p>
      <p style="margin: 0;"><a href="{{UnsubscribeURL}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
            is_default: false
        });
        setEditorTab('code');
        setShowModal(true);
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate({ ...template });
        setEditorTab('code');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!editingTemplate || !editingTemplate.name) {
            alert("Template name is required.");
            return;
        }
        
        setIsSaving(true);
        try {
            const templateData = { 
                ...editingTemplate,
                last_updated: new Date().toISOString()
            };

            // Handle default logic: if this is default, uncheck others locally and save
            if (templateData.is_default) {
                const defaults = templates.filter(t => t.is_default && t.id !== templateData.id);
                for (const t of defaults) {
                    await api.save({ ...t, is_default: false }, 'EmailTemplates');
                }
            }

            await api.save(templateData, 'EmailTemplates');
            await fetchTemplates();
            setShowModal(false);
            setEditingTemplate(null);
        } catch (e: any) {
            console.error("Save failed", e);
            alert("Failed to save template.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await api.delete(id, 'EmailTemplates');
            await fetchTemplates();
        } catch (e) {
            console.error("Delete failed", e);
        }
    };

    const getPreviewHtml = () => {
        if (!editingTemplate?.html_content) return "";
        const sampleContent = `
            <h1 style="color: #1e293b; margin-top: 0;">Hello, Investor!</h1>
            <p>This is a sample message demonstrating how your content will look inside this RAW HTML template. We are checking the layout, spacing, and brand elements.</p>
            <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <strong>Property Match Found:</strong><br>
                123 Maple Street, Atlanta GA<br>
                Price: $185,000 | ARV: $420,000
            </div>
            <p>Best Regards,<br><strong>Ashari Zakar</strong></p>
        `;
        // Supports both standard {{ Content }} and Go Template {{ template "content" . }}
        const placeholderRegex = /\{\{\s*(?:Content|template\s+"content"\s+\.?)\s*\}\}/g;
        return editingTemplate.html_content.replace(placeholderRegex, sampleContent);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900 h-full">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                <p className="text-gray-500 dark:text-gray-400">Loading templates from database...</p>
            </div>
        );
    }

    return (
        <div className="p-8 space-y-6 animate-in fade-in duration-300 bg-gray-50 dark:bg-gray-900 h-full overflow-y-auto custom-scrollbar">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Email Templates</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage RAW HTML wrappers for campaign delivery</p>
                </div>
                <button 
                    onClick={handleCreate}
                    className="bg-blue-600 hover:bg-blue-500 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 shadow-lg"
                >
                    <Plus size={18} /> New Template
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-2xl">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4">Template Name</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Last Updated</th>
                            <th className="px-6 py-4 text-right pr-8">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                        {templates.map((template) => (
                            <tr key={template.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{template.name}</td>
                                <td className="px-6 py-4 text-xs font-mono text-gray-500 dark:text-gray-400">{template.type}</td>
                                <td className="px-6 py-4">
                                    {template.is_default && (
                                        <span className="bg-green-600/20 text-green-400 px-2 py-0.5 rounded text-[10px] font-bold border border-green-500/20 uppercase tracking-tight">Default</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500 dark:text-gray-400">{new Date(template.last_updated).toLocaleDateString()}</td>
                                <td className="px-6 py-4 text-right pr-8">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => handleEdit(template)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => handleDelete(template.id)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {templates.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-20 text-center text-gray-500 dark:text-gray-400 italic">No templates found. Create one to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && editingTemplate && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
                    <div 
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[90vh]"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-600/20 p-2 rounded-lg text-blue-400">
                                    <FileCode size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{editingTemplate.id && templates.find(t=>t.id===editingTemplate.id) ? 'Edit Template' : 'New Template'}</h3>
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest">RAW HTML MODE</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1.5 block">Template Name</label>
                                    <input 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none transition-all"
                                        value={editingTemplate.name}
                                        onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})}
                                        placeholder="e.g. Off-Market Deal Wrapper"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-widest mb-1.5 block">Category</label>
                                    <select 
                                        className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:border-blue-500 outline-none appearance-none cursor-pointer"
                                        value={editingTemplate.type}
                                        onChange={e => setEditingTemplate({...editingTemplate, type: e.target.value})}
                                    >
                                        <option value="Marketing">Marketing</option>
                                        <option value="Transactional">Transactional</option>
                                        <option value="Internal">Internal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-inner">
                                <div className="flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-1 shrink-0">
                                    <button 
                                        onClick={() => setEditorTab('code')}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${editorTab === 'code' ? 'bg-blue-600 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-300'}`}
                                    >
                                        <Code size={14} /> RAW CODE
                                    </button>
                                    <button 
                                        onClick={() => setEditorTab('preview')}
                                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${editorTab === 'preview' ? 'bg-blue-600 text-gray-900 dark:text-white shadow-lg' : 'text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:text-gray-300'}`}
                                    >
                                        <Eye size={14} /> LIVE PREVIEW
                                    </button>
                                </div>

                                <div className="flex-1 min-h-0 relative">
                                    {editorTab === 'code' ? (
                                        <textarea 
                                            className="w-full h-full bg-black/40 text-green-400 font-mono text-sm p-6 leading-relaxed resize-none focus:outline-none custom-scrollbar"
                                            value={editingTemplate.html_content}
                                            onChange={e => setEditingTemplate({...editingTemplate, html_content: e.target.value})}
                                            placeholder="<!-- Enter RAW HTML Code here -->"
                                            spellCheck={false}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-white flex flex-col overflow-hidden">
                                            <iframe 
                                                title="Template Preview"
                                                srcDoc={getPreviewHtml()}
                                                className="w-full h-full border-none"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-6 shrink-0">
                                <div className="flex items-center gap-2 text-blue-400 text-[10px] font-bold uppercase tracking-wide bg-blue-600/5 p-3 rounded-xl border border-blue-500/10 flex-1">
                                    <Info size={16} className="shrink-0" />
                                    <span>Place <b>{"{{ Content }}"}</b> or <b>{"{{ template \"content\" . }}"}</b> where you want the email body.</span>
                                </div>

                                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 shrink-0">
                                    <div className={`p-1.5 rounded-lg ${editingTemplate.is_default ? 'bg-green-600/20 text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                                        <CheckCircle size={16} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Set Default</span>
                                    <button 
                                        onClick={() => setEditingTemplate({...editingTemplate, is_default: !editingTemplate.is_default})}
                                        className={`w-10 h-5 rounded-full transition-all relative ${editingTemplate.is_default ? 'bg-green-600' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${editingTemplate.is_default ? 'left-5.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 shrink-0 bg-gray-50 dark:bg-gray-900/20">
                            <button 
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-all text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving || !editingTemplate.name}
                                className="bg-blue-600 hover:bg-blue-50 disabled:opacity-50 text-gray-900 dark:text-white px-10 py-2.5 rounded-xl font-black shadow-xl shadow-blue-900/30 flex items-center gap-2 transition-all active:scale-95 text-sm"
                            >
                                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                {isSaving ? 'Saving...' : 'Save Template'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
