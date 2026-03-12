import React from 'react';
import { Send, MessageSquare, Mail } from 'lucide-react';

export const MessageCenter: React.FC = () => {
  return (
    <div className="p-6 h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Message Sender</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Send individual emails and text messages to any contact</p>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <Send size={48} className="mb-4 opacity-20" />
        <p>Select a contact to start messaging</p>
      </div>
    </div>
  );
};
