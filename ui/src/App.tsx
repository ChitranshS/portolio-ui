import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import ProfileDropdown from './components/ProfileDropdown';
import { PanelLeftClose, PanelLeft, RefreshCw } from 'lucide-react';
import { Chat, Message, MessageRole, DBQueryResult, convertDBMessagesToChat } from './types';
import ProfileModal from './components/ProfileModal';
import { chatStorage } from './lib/chatStorage';
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
    setIsLoading(true);
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      const posts = await sql`
        SELECT DISTINCT ON (metadata->'writes'->'model'->'messages') metadata -> 'writes' as query
        FROM checkpoints
        ORDER BY metadata->'writes'->'model'->'messages', ctid DESC
        LIMIT 30
      `;
  
      // Use a Set to track message content hashes
      const seenMessages = new Set();
      const uniqueChats: Chat[] = [];
  
      posts.forEach((post, index) => {
        if (post?.query?.model?.messages) {
          const dbMessages = post.query.model.messages;
          
          // Create a hash of the chat content
          const chatHash = JSON.stringify(dbMessages.map(msg => ({
            content: msg.kwargs.content.trim(),
            type: msg.kwargs.type
          })));
  
          if (!seenMessages.has(chatHash)) {
            seenMessages.add(chatHash);
            const newChat = convertDBMessagesToChat(dbMessages, index);
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
  const deleteFromDB = async (chatContent: string) => {
    try {
      const sql = neon(import.meta.env.VITE_DATABASE_URL);
      
      await sql`
        DELETE FROM checkpoints
        WHERE metadata->'writes'->'model'->'messages' @> ${chatContent}::jsonb
      `;
    } catch (error) {
      console.error('Error deleting from database:', error);
      throw error;
    }
  };
  // Load saved chats and fetch DB messages on initial render
  useEffect(() => {
    // const savedChats = chatStorage.getChats();
    // if (savedChats.length > 0) {
    //   setChats(savedChats);
    //   setCurrentChat(savedChats[0]);
    // }
    fetchMessagesFromDB();
  }, []);
  // Load saved chats on initial render
  // useEffect(() => {
  //   const savedChats = chatStorage.getChats();
  //   if (savedChats.length > 0) {
  //     setChats(savedChats);
  //     setCurrentChat(savedChats[0]); // Set most recent chat as current
  //   }
  // }, []);

  const createNewChat = (initialMessage?: string) => {
    const newChat: Chat = {
      id: Date.now(),
      threadId: uuidv4(), // Generate unique thread ID
      title: initialMessage || 'New Chat',
      messages: []
    };
    
    setChats(prevChats => {
      const updatedChats = [newChat, ...prevChats];
      chatStorage.saveChat(newChat);
      return updatedChats;
    });
    setCurrentChat(newChat);
  
    if (initialMessage) {
      handleSendMessage(initialMessage, newChat);
    }
  };
  
  // Modify handleSendMessage to send threadId to backend
  const handleSendMessage = async (message: string, chatToUse?: Chat) => {
    if (isLoading) return;
    
    // Prevent duplicate messages
    if (currentChat?.messages.some(msg => 
      msg.content.trim() === message.trim() && 
      Date.now() - new Date(msg.timestamp).getTime() < 5000
    )) {
      return;
    }
  
    setIsLoading(true);
  
    try {
      const activeChat = chatToUse || currentChat || {
        id: Date.now(),
        threadId: uuidv4(),
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
  
      // Update state with user message
      setChats(prevChats => {
        const chatExists = prevChats.some(c => c.id === updatedChat.id);
        const filteredChats = chatExists 
          ? prevChats.filter(c => c.id !== updatedChat.id) 
          : prevChats;
        return [updatedChat, ...filteredChats];
      });
      setCurrentChat(updatedChat);
  
      // Stream response handling...
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: message.trim(),
          id: updatedChat.id,
          threadId: updatedChat.threadId
        }),
      });
  
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      const fullResponse = data.response || 'No response from assistant';
  
      // Stream the response
      let streamedContent = '';
      const words = fullResponse.split(' ');
      
      for (let i = 0; i < words.length; i++) {
        streamedContent += (i === 0 ? '' : ' ') + words[i];
        
        const updatedAssistantMessage: StreamMessage = {
          ...assistantMessage,
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
        await new Promise(resolve => setTimeout(resolve, 30)); // Adjust speed here
      }
  
      // Save final state to storage
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
      
      chatStorage.saveChat(finalChat);
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
    setIsLoading(true);
    try {
      // Find the chat to delete
      const chatToDelete = chats.find(chat => chat.id === chatId);
      
      if (chatToDelete) {
        // Convert the chat messages to the DB format
        const dbFormatMessages = chatToDelete.messages.map(msg => ({
          kwargs: {
            type: msg.role === 'user' ? 'human' : 'ai',
            content: msg.content
          }
        }));
  
        // Create JSON string for the query
        const chatContent = JSON.stringify(dbFormatMessages);
  
        // Delete from database
        await deleteFromDB(chatContent);
        
        // Delete from local storage and update UI
        chatStorage.deleteChat(chatId);
        setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
        
        // Update current chat if needed
        if (currentChat?.id === chatId) {
          const remainingChats = chats.filter(chat => chat.id !== chatId);
          setCurrentChat(remainingChats[0] || null);
        }
  
        // Refresh chats after deletion
        await fetchMessagesFromDB();
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

      {/* Refresh Button */}
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


// gsutil mb -p headless-utils gs://resume-frontend-chits
// gsutil iam ch allUsers:objectViewer gs://resume-frontend-chits