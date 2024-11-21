import React, { useState, useEffect } from 'react';
import { neon } from '@neondatabase/serverless';
import { Chat, MessageRole } from '../types';
import { Link } from 'react-router-dom';
import { ArrowLeft, Search, MessageSquare, Clock, Trash2, AlertCircle } from 'lucide-react';

function GlobalChats() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [isDeletingIndividual, setIsDeletingIndividual] = useState(false);

  const fetchGlobalChats = async () => {
    try {
      setIsLoading(true);
      if (!import.meta.env.VITE_DATABASE_URL) {
        throw new Error('Database URL is not defined in environment variables');
      }
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      const posts = await sql`
        WITH LastSteps AS (
          SELECT 
            metadata->>'thread_id' as thread_id, 
            MAX((metadata->>'step')::integer) as max_step
          FROM checkpoints
          GROUP BY metadata->>'thread_id'
        )
        SELECT 
          metadata -> 'writes' as query,
          metadata->>'thread_id' as thread_id
        FROM checkpoints c
        INNER JOIN LastSteps ls 
          ON c.metadata->>'thread_id' = ls.thread_id 
          AND (c.metadata->>'step')::integer = ls.max_step
        ORDER BY ls.max_step DESC
        LIMIT 100
      `;

      const seenMessages = new Set();
      const uniqueChats: Chat[] = [];

      posts.forEach((post, index) => {
        if (post?.query?.model?.messages) {
          const dbMessages = post.query.model.messages;
          const threadId = post.thread_id;

          const isPingRequest = dbMessages.some(msg => 
            msg.kwargs.content.trim() === "Respond with OKAY only" || 
            threadId === "pinging_123"
          );
          
          if (!isPingRequest) {
            const chatHash = JSON.stringify(dbMessages.map(msg => ({
              content: msg.kwargs.content.trim(),
              type: msg.kwargs.type
            })));
    
            if (!seenMessages.has(chatHash)) {
              seenMessages.add(chatHash);
              const messages = dbMessages.map(msg => ({
                content: msg.kwargs.content,
                role: msg.kwargs.type === 'human' ? MessageRole.User : MessageRole.Assistant,
                timestamp: new Date().toISOString()
              }));
              
              uniqueChats.push({
                id: Date.now() - (index * 1000),
                threadId,
                title: messages[0]?.content?.slice(0, 100) || 'Chat',
                messages
              });
            }
          }
        }
      });

      setChats(uniqueChats);
    } catch (error) {
      console.error('Error fetching global chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllChats = async () => {
    try {
      setIsDeleting(true);
      if (!import.meta.env.VITE_DATABASE_URL) {
        throw new Error('Database URL is not defined in environment variables');
      }
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      await sql`TRUNCATE TABLE checkpoints`;
      
      setChats([]);
      setSelectedChat(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Error deleting chats:', error);
      alert('Failed to delete chats. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const deleteChat = async (chat: Chat) => {
    try {
      setIsDeletingIndividual(true);
      if (!import.meta.env.VITE_DATABASE_URL) {
        throw new Error('Database URL is not defined in environment variables');
      }
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      await sql`
        DELETE FROM checkpoints 
        WHERE metadata->>'thread_id' = ${chat.threadId}
      `;
      
      setChats(prevChats => prevChats.filter(c => c.id !== chat.id));
      if (selectedChat?.id === chat.id) {
        setSelectedChat(null);
      }
      setChatToDelete(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setIsDeletingIndividual(false);
    }
  };

  useEffect(() => {
    fetchGlobalChats();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <header className="bg-[#1a1b23] border-b border-gray-800 px-4 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <h1 className="text-xl font-semibold text-white">Global Chats</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#282c3a] text-gray-100 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6c5dd3]"
                />
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={18} className="mr-2" />
                Delete All
              </button>
            </div>
          </div>
        </header>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1b23] rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center text-red-500 mb-4">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-semibold">Delete All Chats</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete all chats? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAllChats}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      Delete All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Single Chat Confirmation Modal */}
        {chatToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#1a1b23] rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center text-red-500 mb-4">
                <AlertCircle size={24} className="mr-2" />
                <h2 className="text-xl font-semibold">Delete Chat</h2>
              </div>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this chat? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setChatToDelete(null)}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteChat(chatToDelete)}
                  disabled={isDeletingIndividual}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isDeletingIndividual ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} className="mr-2" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* Chat List */}
            <div className="w-1/3 border-r border-gray-800 bg-[#1a1b23] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6c5dd3]"></div>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredChats.map(chat => (
                    <div
                      key={chat.id}
                      className="group relative"
                    >
                      <button
                        onClick={() => setSelectedChat(chat)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedChat?.id === chat.id
                            ? 'bg-[#6c5dd3] text-white'
                            : 'text-gray-300 hover:bg-[#282c3a]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium truncate">{chat.title}</h3>
                            <p className="text-sm text-gray-400 truncate mt-1">
                              {chat.messages[chat.messages.length - 1]?.content}
                            </p>
                          </div>
                          <div className="ml-2 flex flex-col items-end">
                            <div className="flex items-center text-xs text-gray-400">
                              <Clock size={12} className="mr-1" />
                              {formatTimestamp(chat.messages[chat.messages.length - 1]?.timestamp || '')}
                            </div>
                            <div className="flex items-center text-xs text-gray-400 mt-1">
                              <MessageSquare size={12} className="mr-1" />
                              {chat.messages.length}
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setChatToDelete(chat);
                        }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full
                          ${selectedChat?.id === chat.id
                            ? 'text-white opacity-60 hover:opacity-100'
                            : 'text-gray-400 opacity-0 group-hover:opacity-60 hover:opacity-100'
                          }
                          transition-opacity hover:bg-red-600/20`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat View */}
            <div className="flex-1 bg-[#0a0b0f] overflow-y-auto">
              {selectedChat ? (
                <div className="p-6 space-y-6">
                  <div className="border-b border-gray-800 pb-4">
                    <h2 className="text-xl font-semibold text-white">{selectedChat.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedChat.messages.length} messages · Started {formatTimestamp(selectedChat.messages[0]?.timestamp || '')}
                    </p>
                  </div>
                  <div className="space-y-6">
                    {selectedChat.messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${message.role === MessageRole.User ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-4 ${
                            message.role === MessageRole.User
                              ? 'bg-[#6c5dd3] text-white'
                              : 'bg-[#282c3a] text-gray-100'
                          }`}
                        >
                          <div className="text-sm font-medium mb-1">
                            {message.role === MessageRole.User ? 'User' : 'Assistant'}
                          </div>
                          <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                          <div className="text-xs opacity-50 mt-2">
                            {new Date(message.timestamp || '').toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Select a chat to view the conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GlobalChats;
