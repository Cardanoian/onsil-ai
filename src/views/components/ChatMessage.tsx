import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import { format, parseISO } from 'date-fns';
import { Message } from '../../models/types';
import { MediaLoader } from '../../utils/mediaLoader';
import { devError } from '../../utils/logger';

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
        {/* 캐시된 미디어 또는 오디오 URL 표시 */}
        {message.mediaId && <MediaDisplay mediaId={message.mediaId} />}
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
                  ? `language-${match[1]} bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 block p-2 rounded`
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-1 rounded'
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

// 미디어를 표시하는 컴포넌트 (캐시된 미디어 ID 또는 Blob URL)
interface MediaDisplayProps {
  mediaId: string;
}

const MediaDisplay: React.FC<MediaDisplayProps> = ({ mediaId }) => {
  // Blob URL인지 확인 (blob:로 시작하는지 체크)
  const isBlobUrl = mediaId.startsWith('blob:');

  if (isBlobUrl) {
    // Blob URL인 경우 미디어 타입을 URL에서 추정
    // 이미지인지 오디오인지 구분하기 위해 fetch로 MIME 타입 확인
    return <BlobMediaPlayer blobUrl={mediaId} />;
  } else {
    // 캐시된 미디어 ID인 경우 기존 로직 사용
    return <CachedMedia mediaId={mediaId} />;
  }
};

// Blob URL 미디어 플레이어 컴포넌트 (이미지와 오디오 모두 처리)
interface BlobMediaPlayerProps {
  blobUrl: string;
}

const BlobMediaPlayer: React.FC<BlobMediaPlayerProps> = ({ blobUrl }) => {
  const [mediaType, setMediaType] = useState<'image' | 'audio' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const detectMediaType = () => {
      try {
        // Blob URL에서 직접 MIME 타입을 확인할 수 없으므로
        // 컨텍스트를 통해 추정 (GeminiService에서 생성된 타입 기반)
        // 이미지는 image/png, 오디오는 audio/mp3로 생성됨

        // 임시로 이미지 로드를 시도해서 타입 감지
        const img = new Image();
        img.onload = () => {
          setMediaType('image');
          setLoading(false);
        };
        img.onerror = () => {
          // 이미지 로드 실패 시 오디오로 가정
          setMediaType('audio');
          setLoading(false);
        };
        img.src = blobUrl;
      } catch (error) {
        devError('미디어 타입 감지 실패:', error);
        setMediaType('image'); // 오류 시 이미지로 가정
        setLoading(false);
      }
    };

    detectMediaType();

    // 컴포넌트 언마운트 시 Blob URL 정리
    return () => {
      if (blobUrl.startsWith('blob:')) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleDownload = (filename: string) => {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className='mt-2 flex items-center gap-2'>
        <div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          미디어 로딩 중...
        </span>
      </div>
    );
  }

  return (
    <div className='mt-2'>
      {mediaType === 'image' && (
        <div>
          <img
            src={blobUrl}
            alt='생성된 이미지'
            style={{
              maxWidth: '300px',
              height: 'auto',
              display: 'block',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          <button
            onClick={() => handleDownload('generated-image.png')}
            className='inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs mt-2'
          >
            이미지 다운로드
          </button>
        </div>
      )}

      {mediaType === 'audio' && (
        <div className='flex flex-col items-start gap-2'>
          <audio controls src={blobUrl} style={{ width: '250px' }}>
            브라우저가 오디오 태그를 지원하지 않습니다.
          </audio>
          <button
            onClick={() => handleDownload('generated-audio.mp3')}
            className='inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs'
          >
            오디오 다운로드 (MP3)
          </button>
        </div>
      )}
    </div>
  );
};

// 캐시된 미디어를 표시하는 컴포넌트
interface CachedMediaProps {
  mediaId: string;
}

const CachedMedia: React.FC<CachedMediaProps> = ({ mediaId }) => {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'audio' | null>(null);
  const [mediaFormat, setMediaFormat] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true);
        setError(null);

        // 미디어 타입과 형식 확인
        const type = MediaLoader.getMediaType(mediaId);
        const format = MediaLoader.getMediaFormat(mediaId);

        if (!type || !format) {
          throw new Error('미디어 정보를 찾을 수 없습니다.');
        }

        setMediaType(type);
        setMediaFormat(format);

        // 미디어 로드
        const result = await MediaLoader.load(mediaId);

        if (!result.success) {
          throw new Error(result.error || '미디어 로딩에 실패했습니다.');
        }

        setDataUrl(result.dataUrl!);
      } catch (err) {
        devError('캐시된 미디어 로딩 실패:', err);
        setError(err instanceof Error ? err.message : '알 수 없는 오류');
      } finally {
        setLoading(false);
      }
    };

    loadMedia();
  }, [mediaId]);

  if (loading) {
    return (
      <div className='mt-2 flex items-center gap-2'>
        <div className='w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin'></div>
        <span className='text-sm text-gray-500 dark:text-gray-400'>
          미디어 로딩 중...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400'>
        미디어 로딩 실패: {error}
      </div>
    );
  }

  if (!dataUrl || !mediaType || !mediaFormat) {
    return null;
  }

  return (
    <div className='mt-2'>
      {mediaType === 'image' && (
        <div>
          <img
            src={dataUrl}
            alt='생성된 이미지'
            style={{
              maxWidth: '300px',
              height: 'auto',
              display: 'block',
              borderRadius: '0.5rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          />
          <a
            href={dataUrl}
            download={`generated-image.${mediaFormat}`}
            className='inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs mt-2'
          >
            이미지 다운로드
          </a>
        </div>
      )}

      {mediaType === 'audio' && (
        <div className='flex flex-col items-start gap-2'>
          <audio controls src={dataUrl} style={{ width: '250px' }}>
            브라우저가 오디오 태그를 지원하지 않습니다.
          </audio>
          <a
            href={dataUrl}
            download={`generated-audio.${mediaFormat}`}
            className='inline-block px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs'
          >
            오디오 다운로드 ({mediaFormat.toUpperCase()})
          </a>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
