import React, { useState, useEffect, useRef } from 'react';
import { getResumeFeedback, createInterviewChat } from '../services/geminiService';
import type { Chat } from '@google/genai';
import type { ChatMessage } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import { SendIcon, UserIcon } from '../components/icons';

const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const createMarkup = () => {
        const html = text
          .replace(/### (.*)/g, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
          .replace(/^- (.*)/gm, '<li class="ml-6 list-disc">$1</li>')
          .replace(/\n/g, '<br />');
        return { __html: html };
    };
  
    return <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={createMarkup()} />;
};

const ResumeBuilder: React.FC = () => {
    const [resumeText, setResumeText] = useState('');
    const [feedback, setFeedback] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleGetFeedback = async () => {
        if (!resumeText.trim()) return;
        setIsLoading(true);
        setFeedback('');
        try {
            const result = await getResumeFeedback(resumeText);
            setFeedback(result);
        } catch (error) {
            console.error(error);
            setFeedback('Sorry, there was an error getting feedback.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4 sm:p-6 lg:p-8">
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-white">Resume Editor</h2>
                <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume here..."
                    className="w-full h-96 p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <button
                    onClick={handleGetFeedback}
                    disabled={isLoading || !resumeText.trim()}
                    className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center justify-center"
                >
                    {isLoading ? <LoadingSpinner size="5" color="white" /> : 'Get AI Feedback'}
                </button>
            </div>
            <div>
                <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-white">AI Feedback</h2>
                <div className="w-full h-96 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingSpinner /></div>}
                    {feedback ? <SimpleMarkdown text={feedback} /> : <p className="text-slate-400">Your feedback will appear here...</p>}
                </div>
            </div>
        </div>
    );
}

const MockInterview: React.FC<{ targetRole: string }> = ({ targetRole }) => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const startInterview = async () => {
          setIsLoading(true);
          const interviewChat = createInterviewChat(targetRole);
          setChat(interviewChat);
          try {
            const response = await interviewChat.sendMessage({ message: "Let's begin the interview. Ask me the first question." });
            setMessages([{ role: 'model', parts: [{ text: response.text }] }]);
          } catch(e) {
            console.error(e);
            setMessages([{ role: 'model', parts: [{ text: "Sorry, I can't start the interview right now."}] }]);
          } finally {
            setIsLoading(false);
          }
      };
      startInterview();
    }, [targetRole]);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(scrollToBottom, [messages]);
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await chat.sendMessage({ message: input });
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: response.text }] }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Sorry, I encountered an error.' }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-100 dark:bg-slate-800">
             <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                         {msg.role === 'model' && (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">AI</div>
                         )}
                         <div className={`max-w-xl p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 rounded-bl-none'}`}>
                            <SimpleMarkdown text={msg.parts[0].text} />
                         </div>
                         {msg.role === 'user' && (
                             <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0"><UserIcon className="h-6 w-6" /></div>
                         )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">AI</div>
                        <div className="max-w-lg p-4 rounded-2xl bg-white dark:bg-slate-700">
                           <div className="flex items-center space-x-2"><span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span><span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span><span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Your answer..." disabled={isLoading || messages.length === 0} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                    <button type="submit" disabled={isLoading || !input.trim()} className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"><SendIcon className="h-6 w-6" /></button>
                </form>
            </div>
        </div>
    );
};

const ResumeScreen: React.FC<{ targetRole: string }> = ({ targetRole }) => {
    const [activeTab, setActiveTab] = useState<'resume' | 'interview'>('resume');

    return (
        <div className="h-full flex flex-col">
            <header className="p-4 border-b border-slate-200 dark:border-slate-700">
                 <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Resume & Interview Prep</h1>
                 <div className="mt-4 border-b border-slate-200 dark:border-slate-700">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button onClick={() => setActiveTab('resume')} className={`${activeTab === 'resume' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>Resume Builder</button>
                        <button onClick={() => setActiveTab('interview')} disabled={!targetRole} className={`${activeTab === 'interview' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed`}>Mock Interview</button>
                    </nav>
                 </div>
            </header>
            <main className="flex-1 overflow-y-auto">
                {activeTab === 'resume' && <ResumeBuilder />}
                {activeTab === 'interview' && (targetRole ? <MockInterview targetRole={targetRole} /> : <div className="p-8 text-center text-slate-500">Please select a career on the dashboard to start a mock interview.</div>)}
            </main>
        </div>
    );
};

export default ResumeScreen;
