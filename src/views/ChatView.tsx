import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatController } from '../controllers/ChatController';
import { Message } from '../models/types';
import { Header } from './components/Header';
import { devLog } from '../utils/logger';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  // const lastTick = useRef(performance.now());
  const controller = useRef(ChatController.getInstance()).current;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const tickLimit = 300;

  useEffect(() => {
    setMessages(controller.getMessages());
    const unsubscribe = controller.subscribe(() => {
      setMessages(controller.getMessages());
    });
    return () => {
      unsubscribe();
    };
  }, [controller]);

  // useEffect(() => {
  //   const thisTick = performance.now();
  //   if (thisTick - lastTick.current < tickLimit) return;
  //   lastTick.current = thisTick;
  //   messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages]);

  const handleSend = async (
    ...args: Parameters<typeof controller.sendMessage>
  ) => {
    setIsGenerating(true);
    try {
      await controller.sendMessage(...args);
    } catch (error) {
      if (error instanceof Error) {
        devLog(error.message);
      } else {
        devLog('알 수 없는 에러가 발생');
      }
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStop = () => {
    controller.stopGeneration();
    setIsGenerating(false);
  };

  return (
    <div className='flex flex-col h-[var(--app-height)] max-h-[var(--app-height)] overflow-hidden'>
      {/* 헤더 */}
      <Header />

      {/* 채팅 화면 */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom bg-gray-100 dark:bg-gray-900'>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력창 */}
      <div className='flex-none border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4'>
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isGenerating={isGenerating}
        />
      </div>
    </div>
  );
};

export default ChatView;
