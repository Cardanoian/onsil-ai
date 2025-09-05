import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import { format, parseISO } from 'date-fns';
import { Message } from '../../models/types';

interface Props {
  message: Message;
}
export const ChatMessage: React.FC<Props> = ({ message }) => {
  const formattedTime = format(parseISO(message.timestamp), 'HH:mm');
  return (
    <div
      className={`fade-in flex ${
        message.role === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`max-w-[90%] p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 border dark:border-gray-700 dark:text-white'
        }`}
      >
        <div className='flex justify-between items-center mb-2'>
          <span className='text-xs'>{formattedTime}</span>
        </div>
        {message.role === 'user' ? (
          <div className='text-[15px] whitespace-pre-wrap'>
            {message.content}
          </div>
        ) : (
          <>
            <MarkdownContents message={message} />
            {(message.content.includes('이미지를 생성 중입니다') ||
              message.content.includes('오디오를 생성 중입니다')) && (
              <div className='flex justify-center mt-2'>
                <div className='w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
              </div>
            )}
          </>
        )}
        {message.file && (
          <div className='text-sm mt-2 opacity-75 dark:text-gray-300'>
            {message.file.name}
            {/* 이미지 미리보기 */}
            {/\.(jpe?g|png)$/i.test(message.file.name) && (
              <img
                src={message.file.content}
                alt={message.file.name}
                style={{
                  maxWidth: '300px',
                  height: 'auto',
                  display: 'block',
                  marginTop: '0.5rem',
                  borderRadius: '0.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              />
            )}
            {/* 오디오 미리듣기 및 다운로드 */}
            {(message.file.mime === 'audio/wav' ||
              message.file.mime === 'audio/mpeg' ||
              /\.mp3$/i.test(message.file.name)) && (
              <div className='mt-2 flex flex-col items-start gap-2'>
                <audio
                  controls
                  src={message.file.content}
                  style={{ width: '250px', marginTop: '0.5rem' }}
                >
                  브라우저가 오디오 태그를 지원하지 않습니다.
                </audio>
                <a
                  href={message.file.content}
                  download={message.file.name}
                  className='inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs mt-1'
                >
                  오디오 다운로드
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function preprocessMath(text: string): string {
  // \( ... \) → $...$
  let result = text.replace(/\\\((.+?)\\\)/gs, (_m, p1) => `$${p1}$`);
  // \[ ... \] → $$...$$
  result = result.replace(/\\\[(.+?)\\\]/gs, (_m, p1) => `$$${p1}$$`);
  return result;
}

const MarkdownContents: React.FC<Props> = ({ message }) => (
  <>
    <ReactMarkdown
      className='prose prose-base dark:prose-invert max-w-none text-[15px]'
      rehypePlugins={[rehypeKatex]}
      remarkPlugins={[remarkMath, remarkGfm]}
      components={{
        pre: (props) => (
          <pre
            className='bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-x-auto scrollbar-custom'
            {...props}
          />
        ),
        code: ({ className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          return (
            <code
              className={
                match
                  ? `language-${match[1]} bg-gray-100 dark:bg-gray-700 block p-2 rounded`
                  : 'bg-gray-100 dark:bg-gray-700 px-1 rounded'
              }
              {...props}
            >
              {children}
            </code>
          );
        },
        p: (props) => (
          <p
            className='mb-4 last:mb-0 dark:text-gray-200 text-[15px]'
            {...props}
          />
        ),
        ul: (props) => (
          <ul
            className='list-disc list-inside mb-4 dark:text-gray-200 text-[15px]'
            {...props}
          />
        ),
        ol: (props) => (
          <ol
            className='list-decimal list-inside mb-4 dark:text-gray-200 text-[15px]'
            {...props}
          />
        ),
        li: (props) => (
          <li
            className='mb-2 last:mb-0 dark:text-gray-200 text-[15px]'
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote
            className='border-l-4 border-gray-200 dark:border-gray-600 pl-4 my-4 italic dark:text-gray-300 text-[15px]'
            {...props}
          />
        ),
        a: (props) => (
          <a
            className='text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-[15px]'
            {...props}
          />
        ),
        h1: (props) => (
          <h1
            className='text-2xl font-bold mb-4 dark:text-gray-100 text-[15px]'
            {...props}
          />
        ),
        h2: (props) => (
          <h2
            className='text-xl font-bold mb-3 dark:text-gray-100 text-[15px]'
            {...props}
          />
        ),
        h3: (props) => (
          <h3
            className='text-lg font-bold mb-3 dark:text-gray-100 text-[15px]'
            {...props}
          />
        ),
        img: (props) => (
          <img
            {...props}
            style={{
              maxWidth: '300px',
              height: 'auto',
              display: 'block',
              margin: '0.5rem 0',
            }}
            alt={props.alt || ''}
          />
        ),
        table: (props) => (
          <div className='overflow-x-auto scrollbar-custom mb-4'>
            <table
              className='min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-[15px]'
              {...props}
            />
          </div>
        ),
        th: (props) => (
          <th
            className='px-4 py-2 bg-gray-50 dark:bg-gray-700 text-left dark:text-gray-200 text-[15px]'
            {...props}
          >
            {props.children}
          </th>
        ),
        td: (props) => (
          <td
            className='px-4 py-2 border-t border-gray-200 dark:border-gray-700 dark:text-gray-200 text-[15px]'
            {...props}
          >
            {props.children}
          </td>
        ),
      }}
    >
      {preprocessMath(message.content) || '▋'}
    </ReactMarkdown>
  </>
);

export default ChatMessage;
