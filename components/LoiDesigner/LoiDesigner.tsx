import React, { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Mail, MessageSquare, CheckSquare } from 'lucide-react';
import { mockOfferTemplates } from '../../services/mockData';
import { OfferTemplate } from '../../types';

export const LoiDesigner: React.FC = () => {
  const [templates, setTemplates] = useState<OfferTemplate[]>(mockOfferTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<OfferTemplate | null>(null);

  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LOI Designer</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create complete offer packages with LOI, email, and text message templates</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
          <Plus size={16} /> Create Package
        </button>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Template List */}
        <div className="w-1/3 min-w-[300px] flex flex-col gap-4 overflow-y-auto">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText size={18} /> Offer Packages
          </h2>
          {templates.map(template => (
            <div 
              key={template.id} 
              className={`bg-white dark:bg-gray-800 p-4 rounded-lg border cursor-pointer transition ${selectedTemplate?.id === template.id ? 'border-blue-500 shadow-md ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 shadow-sm'}`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white">{template.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  template.type === 'Hybrid' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  template.type === 'Cash' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                }`}>
                  {template.type}
                </span>
              </div>
              <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1"><Mail size={12} /> Email</span>
                <span className="flex items-center gap-1"><MessageSquare size={12} /> Text</span>
                <span className="flex items-center gap-1"><FileText size={12} /> LOI</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                <button className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition">
                  <Edit size={12} /> Edit Package
                </button>
                <button className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 transition">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Template Editor */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col overflow-hidden">
          {selectedTemplate ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{selectedTemplate.name}</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition">
                  Save Package
                </button>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid grid-cols-2 gap-6 h-full">
                  {/* Editor Side */}
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <FileText size={16} /> LOI Document Template
                      </label>
                      <textarea 
                        className="w-full h-48 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
                        value={selectedTemplate.loiBody}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, loiBody: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Mail size={16} /> Email Message
                      </label>
                      <textarea 
                        className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
                        value={selectedTemplate.emailBody}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, emailBody: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <MessageSquare size={16} /> Text Message (Optional)
                      </label>
                      <textarea 
                        className="w-full h-24 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono resize-none"
                        value={selectedTemplate.smsBody}
                        onChange={(e) => setSelectedTemplate({...selectedTemplate, smsBody: e.target.value})}
                      />
                      <div className="text-right text-xs text-gray-500 mt-1">
                        {selectedTemplate.smsBody.length}/160 characters
                      </div>
                    </div>
                  </div>

                  {/* Preview Side */}
                  <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                      <CheckSquare size={16} className="text-green-500" /> Live Preview
                    </h3>
                    
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-6 shadow-sm mb-4">
                      <div className="text-xs text-gray-400 mb-4 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">LOI Document</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-serif">
                        {selectedTemplate.loiBody.replace(/\{\{(.*?)\}\}/g, '[Variable: $1]')}
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded p-4 shadow-sm mb-4">
                      <div className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold border-b border-gray-100 dark:border-gray-700 pb-2">Email Preview</div>
                      <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                        {selectedTemplate.emailBody.replace(/\{\{(.*?)\}\}/g, '[Variable: $1]')}
                      </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-4 shadow-sm">
                      <div className="text-xs text-blue-400 mb-2 uppercase tracking-wider font-semibold border-b border-blue-100 dark:border-blue-800/50 pb-2">SMS Preview</div>
                      <div className="text-sm text-blue-900 dark:text-blue-100 whitespace-pre-wrap">
                        {selectedTemplate.smsBody.replace(/\{\{(.*?)\}\}/g, '[Variable: $1]')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
              <FileText size={48} className="mb-4 opacity-20" />
              <p>Select an offer package to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
