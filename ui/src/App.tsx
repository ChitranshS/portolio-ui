import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft, RefreshCw } from 'lucide-react';
import { Chat, Message, MessageRole, DBQueryResult, convertDBMessagesToChat } from './types';
import ProfileModal from './components/ProfileModal';
import { v4 as uuidv4 } from 'uuid';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv'

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMessagesFromDB = async () => {
    try {
      if (!import.meta.env.VITE_DATABASE_URL) {
        throw new Error('Database URL is not defined in environment variables');
      }
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      const threadId = currentChat?.threadId;
      let posts;
  
      if (threadId) {
        // If we have a current chat, get its latest state
        posts = await sql`
          WITH LastSteps AS (
            SELECT 
              metadata->>'thread_id' as thread_id, 
              MAX((metadata->>'step')::integer) as max_step
            FROM checkpoints
            WHERE metadata->>'thread_id' = ${threadId}
            GROUP BY metadata->>'thread_id'
          )
          SELECT 
            metadata -> 'writes' as query,
            metadata->>'thread_id' as thread_id  -- Added thread_id to selection
          FROM checkpoints c
          INNER JOIN LastSteps ls 
            ON c.metadata->>'thread_id' = ls.thread_id 
            AND (c.metadata->>'step')::integer = ls.max_step
        `;
      } else {
        // If no current chat, get last states of all threads
        posts = await sql`
          WITH LastSteps AS (
            SELECT 
              metadata->>'thread_id' as thread_id, 
              MAX((metadata->>'step')::integer) as max_step
            FROM checkpoints
            GROUP BY metadata->>'thread_id'
          )
          SELECT 
            metadata -> 'writes' as query,
            metadata->>'thread_id' as thread_id  -- Added thread_id to selection
          FROM checkpoints c
          INNER JOIN LastSteps ls 
            ON c.metadata->>'thread_id' = ls.thread_id 
            AND (c.metadata->>'step')::integer = ls.max_step
          LIMIT 30
        `;
      }
  
      const seenMessages = new Set();
      const uniqueChats: Chat[] = [];
  
      posts.forEach((post, index) => {
        if (post?.query?.model?.messages) {
          const dbMessages = post.query.model.messages;
          const threadId = post.thread_id; // Get thread_id from the query result
          
          const chatHash = JSON.stringify(dbMessages.map(msg => ({
            content: msg.kwargs.content.trim(),
            type: msg.kwargs.type
          })));
  
          if (!seenMessages.has(chatHash)) {
            seenMessages.add(chatHash);
            // Pass threadId to the conversion function
            const newChat = convertDBMessagesToChat(dbMessages, index, threadId);
            uniqueChats.push(newChat);
          }
        }
      });
  
      setChats(uniqueChats);
      if (uniqueChats.length > 0 && !currentChat) {
        setCurrentChat(uniqueChats[0]);
      }
  
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteFromDB = async (threadId: string) => {
    try {
      if (!import.meta.env.VITE_DATABASE_URL) {
        throw new Error('Database URL is not defined in environment variables');
      }
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      // Delete from multiple tables
      await sql`
        DELETE FROM checkpoints 
        WHERE metadata->>'thread_id' = ${threadId};
      `;
  
      await sql`
        DELETE FROM checkpoint_blobs 
        WHERE thread_id = ${threadId};
      `;
  
      await sql`
        DELETE FROM checkpoint_writes 
        WHERE thread_id = ${threadId};
      `;
  
    } catch (error) {
      console.error('Error deleting from database:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessagesFromDB();
  }, []);

  const createNewChat = (initialMessage?: string) => {
    const newChat: Chat = {
      id: Date.now(),
      threadId: uuidv4(), // Generate new thread ID only for new chats
      title: initialMessage || 'New Chat',
      messages: []
    };
    
    setChats(prevChats => {
      const updatedChats = [newChat, ...prevChats];
      return updatedChats;
    });
    setCurrentChat(newChat);
  
    if (initialMessage) {
      handleSendMessage(initialMessage, newChat);
    }
  };
  
  const handleSendMessage = async (message: string, chatToUse?: Chat) => {
    if (isLoading) return;
    
    try {
      const activeChat = chatToUse || currentChat || {
        id: Date.now(),
        threadId: uuidv4(), // Only generate new threadId for completely new chats
        title: message,
        messages: [],
      };
      const userMessage: Message = {
        content: message.trim(),
        role: 'user',
        timestamp: new Date().toISOString()
      };
  
      const updatedChat: Chat = {
        ...activeChat,
        title: activeChat.messages.length === 0 ? message : activeChat.title,
        messages: [...(activeChat.messages || []), userMessage]
      };
  
      setChats(prevChats => {
        const chatExists = prevChats.some(c => c.id === updatedChat.id);
        const filteredChats = chatExists 
          ? prevChats.filter(c => c.id !== updatedChat.id) 
          : prevChats;
        return [updatedChat, ...filteredChats];
      });
      setCurrentChat(updatedChat);
  
      const initialAssistantMessage: StreamMessage = {
        content: "",
        role: 'assistant',
        timestamp: new Date().toISOString(),
        isStreaming: true
      };
  
      const chatWithAssistant = {
        ...updatedChat,
        messages: [...updatedChat.messages, initialAssistantMessage]
      };
      setCurrentChat(chatWithAssistant);
  
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        credentials: 'omit',
        body: JSON.stringify({
          query: message.trim(),
          id: activeChat.id,
          threadId: activeChat.threadId // Use the threadId from the active chat
        }),
      });
  
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const fullResponse = data.response || 'No response from assistant';
  
      let streamedContent = '';
      const words = fullResponse.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        streamedContent += (i === 0 ? '' : ' ') + words[i];
        
        const updatedAssistantMessage: StreamMessage = {
          ...initialAssistantMessage,
          content: streamedContent,
          fullContent: fullResponse,
          isStreaming: i < words.length - 1
        };
  
        const updatedChatWithStream = {
          ...chatWithAssistant,
          messages: [
            ...chatWithAssistant.messages.slice(0, -1),
            updatedAssistantMessage
          ]
        };
  
        setCurrentChat(updatedChatWithStream);
        await new Promise(resolve => setTimeout(resolve, 30));
      }
  
      const finalChat = {
        ...chatWithAssistant,
        messages: [
          ...chatWithAssistant.messages.slice(0, -1),
          {
            content: fullResponse,
            role: 'assistant',
            timestamp: new Date().toISOString()
          }
        ]
      };
      
      setChats(prevChats => {
        const filteredChats = prevChats.filter(c => c.id !== finalChat.id);
        return [finalChat, ...filteredChats];
      });
  
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: number) => {
    try {
      const chatToDelete = chats.find(chat => chat.id === chatId);
      
      if (chatToDelete?.threadId) {
        // Delete all messages with this thread ID
        await deleteFromDB(chatToDelete.threadId);
        
        // Update local state
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        // If the deleted chat was the current chat, select a new current chat
        if (currentChat?.id === chatId) {
          const remainingChats = chats.filter(chat => chat.id !== chatId);
          setCurrentChat(remainingChats[0] || null);
        }
  
        // Refresh the chat list from database
        await fetchMessagesFromDB();
      } else {
        console.error('No thread ID found for chat to delete');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#1E1E1E] text-gray-100 relative">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <PanelLeftClose size={24} /> : <PanelLeft size={24} />}
      </button>

      <button
        onClick={fetchMessagesFromDB}
        className="fixed top-4 right-20 z-50 p-2 bg-[#2A2A2A] rounded-lg hover:bg-[#3A3A3A] transition-colors"
        aria-label="Refresh messages"
      >
        <RefreshCw size={24} />
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-full w-64 z-30 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          chats={chats}
          currentChat={currentChat}
          setCurrentChat={setCurrentChat}
          onNewChat={() => createNewChat()}
          onDeleteChat={handleDeleteChat}
          isLoading={isLoading}
        />
      </div>

      <div className="flex-1 pl-0">
        <div className="relative h-full">
          <div className="absolute top-4 right-4 z-40">
            <ProfileDropdown />
          </div>
          <ChatArea
            currentChat={currentChat}
            onSendMessage={handleSendMessage}
            createNewChat={createNewChat}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export default App;