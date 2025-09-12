import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react';
import { Send, Paperclip, X, StopCircle, Image, Mic } from 'lucide-react';
import { FileData } from '../../models/types';
import * as XLSX from 'xlsx';

interface Props {
  onSend: (
    message: string,
    timestamp: string,
    fileData?: FileData,
    buttonType?: ButtonType
  ) => Promise<void>;
  onStop: () => void;
  isGenerating: boolean;
}

type ButtonType = 'file' | 'image' | 'audio' | null;

export const ChatInput: React.FC<Props> = ({
  onSend,
  onStop,
  isGenerating,
}) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | undefined>();
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | undefined>(); // 이미지 미리보기들
  const [isMobile, setIsMobile] = useState(false);
  const [activeButton, setActiveButton] = useState<ButtonType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 모바일 환경 감지
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobile(/iphone|ipad|ipod|android/.test(userAgent));
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 메시지 전송 처리
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !attachedFile) return;

    let fileData: FileData | undefined;
    if (attachedFile) {
      // 첫 번째 파일만 사용 (단일 파일 지원)
      const file = attachedFile;
      const content = await readFileContent(file);

      // Excel 파일인 경우 CSV로 변환되었으므로 mime 타입을 text/csv로 변경
      const isExcelFile =
        file.type ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.type === 'application/vnd.ms-excel' ||
        /\.(xlsx?|xls)$/i.test(file.name);

      fileData = {
        file,
        name: isExcelFile
          ? file.name.replace(/\.(xlsx?|xls)$/i, '.csv')
          : file.name,
        content,
        mime: isExcelFile ? 'text/csv' : file.type,
        path: file.name, // 임시로 파일명을 경로로 사용
      };
    }

    const currentInput = input;
    setInput('');

    const timestamp = new Date().toISOString();

    if (isGenerating) {
      onStop();
    }
    await onSend(currentInput, timestamp, fileData, activeButton);
    setAttachedFile(undefined);
    setFilePreviewUrl(undefined);
    setActiveButton(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
    }
  };

  // Enter 키 처리
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!isMobile && e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form && (input.trim() || attachedFile)) {
        form.requestSubmit();
      }
    }
  };

  // Excel 파일을 CSV로 변환
  const convertExcelToCSV = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          // 첫 번째 시트를 CSV로 변환
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const csvData = XLSX.utils.sheet_to_csv(worksheet);

          // CSV 데이터를 base64로 인코딩
          const encoder = new TextEncoder();
          const uint8Array = encoder.encode(csvData);
          const binaryString = Array.from(uint8Array, (byte) =>
            String.fromCharCode(byte)
          ).join('');
          const base64CSV = btoa(binaryString);
          resolve(`data:text/csv;base64,${base64CSV}`);
        } catch (error) {
          reject(new Error(`Excel 파일 변환에 실패했습니다.\n${error}`));
        }
      };
      reader.onerror = () =>
        reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
      reader.readAsArrayBuffer(file);
    });
  };

  // 파일 읽기 처리
  const readFileContent = async (file: File): Promise<string> => {
    // Excel 파일인 경우 CSV로 변환
    if (
      file.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      /\.(xlsx?|xls)$/i.test(file.name)
    ) {
      return convertExcelToCSV(file);
    }

    // 다른 파일들은 기존 방식으로 처리
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === 'string') {
          resolve(e.target.result); // base64 string
        } else {
          reject(new Error('파일 처리에 실패했습니다.'));
        }
      };
      reader.onerror = () =>
        reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
      reader.readAsDataURL(file);
    });
  };

  // 텍스트 입력창 변경 처리
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // 파일 선택 처리
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) {
      return;
    }
    setAttachedFile(undefined);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      const fileType = file.type;
      if (
        fileType === 'image/jpeg' ||
        fileType === 'image/png' ||
        fileType === 'image/webp' ||
        fileType === 'image/heic' ||
        fileType === 'image/heif' ||
        fileType === 'text/plain' ||
        fileType === 'text/csv' ||
        fileType === 'application/pdf' ||
        fileType ===
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel' ||
        /\.pdf$/i.test(file.name) ||
        /\.(xlsx?|xls)$/i.test(file.name)
      ) {
        // 기존 파일 배열에 새 파일 추가
        setAttachedFile(file);

        if (/(\.jpe?g|\.png|\.webp|\.heic|\.heif)$/i.test(file.name)) {
          // 이미지 파일이면 미리보기 생성
          const url = URL.createObjectURL(file);
          setFilePreviewUrl(url);
        } else {
          setFilePreviewUrl(undefined);
        }
      } else {
        alert(
          '지원되는 파일 형식: txt, csv, xlsx, xls, pdf, jpg, jpeg, png, webp, heic, heif'
        );
      }

      // 파일 입력 초기화 (같은 파일을 다시 선택할 수 있도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // 특정 파일 제거 처리
  const removeAttachedFile = () => {
    setAttachedFile(undefined);
    setFilePreviewUrl(undefined);
  };

  // 버튼 클릭 처리
  const handleButtonClick = (buttonType: ButtonType) => {
    if (activeButton === buttonType) {
      // 같은 버튼을 다시 클릭하면 비활성화
      setActiveButton(null);
      return;
    }

    if (buttonType === 'image' || buttonType === 'audio') {
      setActiveButton(buttonType);
    }

    // 파일 입력 트리거 (파일 버튼만)
    if (buttonType === 'file' && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // form 빈 부분 클릭 시 textarea 포커스
  const handleFormClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 클릭된 요소가 버튼이나 인터랙티브 요소가 아닌 경우에만 textarea 포커스
    const target = e.target as HTMLElement;
    const isInteractiveElement =
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input');

    if (!isInteractiveElement && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='max-w-9xl mx-auto'>
      {attachedFile && (
        <div className='mb-2 space-y-2'>
          <div
            key={`${attachedFile.name}`}
            className='p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between gap-2'
          >
            <span className='text-sm text-gray-600 dark:text-gray-300 flex items-center'>
              {filePreviewUrl ? (
                <img
                  src={filePreviewUrl}
                  alt='Preview'
                  className='w-8 h-8 mr-2 rounded object-cover'
                />
              ) : null}
              {attachedFile.name}
            </span>
            <button
              type='button'
              onClick={() => removeAttachedFile()}
              className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            >
              <X className='w-4 h-4' />
            </button>
          </div>
        </div>
      )}

      <div
        className='border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 cursor-text'
        onClick={handleFormClick}
      >
        {/* 텍스트 입력과 전송 버튼 영역 */}
        <div className='flex items-end gap-2 p-3'>
          <textarea
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder='온실이에게 물어보기'
            className='flex-1 bg-transparent text-gray-900 dark:text-white resize-none min-h-[40px] max-h-[160px] overflow-y-auto focus:outline-none'
            style={{
              height: '40px',
              overflowY:
                input.trim().split('\n').length > 1 ? 'auto' : 'hidden',
            }}
            ref={textareaRef}
            rows={1}
          />

          {/* 전송 버튼 */}
          <button
            type='submit'
            className={`p-2 rounded-lg transition-colors ${
              isGenerating
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {isGenerating ? (
              <StopCircle className='w-5 h-5' />
            ) : (
              <Send className='w-5 h-5' />
            )}
          </button>
        </div>

        {/* 하단 버튼 영역 */}
        <div className='flex items-center justify-between px-3 py-2'>
          <div className='flex items-center space-x-1'>
            {/* 파일첨부 버튼 */}
            <button
              type='button'
              onClick={() => handleButtonClick('file')}
              className={`p-1.5 rounded-md transition-colors ${
                attachedFile
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Paperclip className='w-4 h-4' />
            </button>

            {/* 이미지 버튼 */}
            <button
              type='button'
              onClick={() => handleButtonClick('image')}
              className={`p-1.5 rounded-md transition-colors ${
                activeButton === 'image'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Image className='w-4 h-4' />
            </button>

            {/* 오디오 버튼 */}
            <button
              type='button'
              onClick={() => handleButtonClick('audio')}
              className={`p-1.5 rounded-md transition-colors ${
                activeButton === 'audio'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Mic className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* 숨겨진 파일 입력 */}
      <input
        type='file'
        className='hidden'
        onChange={handleFileSelect}
        ref={fileInputRef}
        multiple
        accept='text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,image/jpeg,image/png,image/webp,.txt,.csv,.pdf,.xlsx,.xls,.jpg,.jpeg,.png,.webp'
      />
    </form>
  );
};

export default ChatInput;
