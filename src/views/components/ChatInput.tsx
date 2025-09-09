import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  FormEvent,
} from 'react';
import { Send, Paperclip, X, StopCircle, Image, Mic } from 'lucide-react';
import jschardet from 'jschardet';
import { FileData } from '../../models/types';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import * as XLSX from 'xlsx';
import { devLog, devError } from '../../utils/logger';

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

interface CsvRow {
  [key: string]: string;
}

type ButtonType = 'file' | 'image' | 'audio' | null;

export const ChatInput: React.FC<Props> = ({
  onSend,
  onStop,
  isGenerating,
}) => {
  const [input, setInput] = useState('');
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null); // 이미지 미리보기
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
      const content = await readFileContent(attachedFile);
      fileData = {
        file: attachedFile,
        name: attachedFile.name,
        content,
        mime: attachedFile.type,
        path: attachedFile.name, // 임시로 파일명을 경로로 사용
      };
    }

    const currentInput = input;
    setInput('');

    const timestamp = new Date().toISOString();

    if (isGenerating) {
      onStop();
    }
    await onSend(currentInput, timestamp, fileData, activeButton);
    setAttachedFile(null);
    setFilePreviewUrl(null);
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

  // 파일 읽기 처리 (텍스트/CSV/이미지/Excel 구분)
  const readFileContent = async (file: File): Promise<string> => {
    const isImage = /(\.jpe?g|\.png)$/i.test(file.name);
    const isPdf = /\.pdf$/i.test(file.name);
    const isExcel = /\.(xlsx?|xls)$/i.test(file.name);

    if (isImage) {
      // 이미지 파일은 base64(DataURL)로 읽음
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            resolve(e.target.result); // base64 string
          } else {
            reject(new Error('이미지 파일 처리에 실패했습니다.'));
          }
        };
        reader.onerror = () =>
          reject(new Error('이미지 파일을 읽는 중 오류가 발생했습니다.'));
        reader.readAsDataURL(file);
      });
    }

    if (isPdf) {
      // PDF 파일 처리: pdfjs-dist로 텍스트 추출
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument({ data: typedarray })
              .promise;
            // PDF TextItem 타입 정의 (필요한 속성만)
            type PDFTextItem = { str: string };
            let text = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const content = await page.getTextContent();
              const pageText = (content.items as PDFTextItem[])
                .map((item) => item.str)
                .join(' ');
              text += `\n\n--- Page ${i} ---\n\n${pageText}`;
            }
            resolve(`==== 첨부파일(PDF) 내용 (markdown) ====\n\n${text}`);
          } catch (error) {
            if (error instanceof Error) {
              devLog(error);
            } else {
              reject(new Error('PDF 파일 처리 중 오류가 발생했습니다.'));
            }
          }
        };
        reader.onerror = () =>
          reject(new Error('PDF 파일을 읽는 중 오류가 발생했습니다.'));
        reader.readAsArrayBuffer(file);
      });
    }

    if (isExcel) {
      // Excel 파일 처리: 모든 시트를 CSV 형태로 변환
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });

            let allSheetsText = '';

            // 모든 시트를 순회하며 처리
            workbook.SheetNames.forEach((sheetName) => {
              const worksheet = workbook.Sheets[sheetName];

              // 시트를 JSON 배열로 변환
              const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
              });

              if (jsonData.length > 0) {
                // 시트 구분자 추가
                allSheetsText += `\n\n=== 시트: ${sheetName} ===\n\n`;

                // 헤더와 데이터 분리
                const headers = jsonData[0] as string[];
                const rows = jsonData.slice(1);

                // CSV 형태의 객체 배열로 변환
                const csvData = rows.map((row) => {
                  const rowObj: { [key: string]: string } = {};
                  const rowArray = row as (
                    | string
                    | number
                    | boolean
                    | null
                    | undefined
                  )[];
                  headers.forEach((header, colIndex) => {
                    rowObj[header || `Column${colIndex + 1}`] =
                      rowArray[colIndex]?.toString() || '';
                  });
                  return rowObj;
                });

                // JSON 문자열로 변환하여 추가
                allSheetsText += JSON.stringify(csvData, null, 2);
              }
            });

            resolve(`==== 첨부파일(Excel) 내용 ====\n${allSheetsText}`);
          } catch (error) {
            reject(
              new Error(`Excel 파일 처리 중 오류가 발생했습니다: ${error}`)
            );
          }
        };

        reader.onerror = () =>
          reject(new Error('Excel 파일을 읽는 중 오류가 발생했습니다.'));

        reader.readAsArrayBuffer(file);
      });
    }

    // 텍스트/CSV 파일 처리, 기존 로직 유지
    const detectEncoding = async (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result instanceof ArrayBuffer) {
            const uint8Array = new Uint8Array(e.target.result);
            // uint8Array를 문자열로 변환
            const binaryString = Array.from(uint8Array)
              .map((byte) => String.fromCharCode(byte))
              .join('');
            const result = jschardet.detect(binaryString);
            resolve(result.encoding || 'UTF-8');
          }
        };
        reader.onerror = () =>
          reject(new Error('인코딩 감지 중 오류가 발생했습니다.'));
        reader.readAsArrayBuffer(file.slice(0, 4096));
      });
    };

    const readWithEncoding = async (
      file: File,
      encoding: string
    ): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const result = event.target?.result;
            if (!result) {
              throw new Error('Failed to read file');
            }

            if (file.type === 'text/csv') {
              const text = result.toString();
              const lines = text.split(/\r\n|\n/).filter((line) => line.trim());
              if (lines.length === 0) {
                throw new Error('빈 CSV 파일입니다.');
              }
              const headers = lines[0].split(',').map((h) => h.trim());
              const jsonData = lines.slice(1).map((line) => {
                const values = line.split(',');
                return headers.reduce<CsvRow>((obj, header, index) => {
                  obj[header] = values[index]?.trim() || '';
                  return obj;
                }, {});
              });

              return resolve(
                `==== 첨부파일 내용 ====\n${JSON.stringify(jsonData, null, 2)}`
              );
            }
            if (file.type === 'text/plain') {
              const text = result.toString();
              return resolve(`==== 첨부파일 내용 ====\n
${text}`);
            }
          } catch (error) {
            reject(new Error(`파일 처리 중 오류가 발생했습니다.\n${error}`));
          }
        };

        reader.onerror = () =>
          reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));

        reader.readAsText(file, encoding);
      });
    };

    try {
      const detectedEncoding = await detectEncoding(file);
      try {
        const result = await readWithEncoding(file, detectedEncoding);
        return result;
      } catch (error) {
        const fallbackEncodings = ['UTF-8', 'CP949', 'EUC-KR'];
        for (const encoding of fallbackEncodings) {
          if (encoding !== detectedEncoding) {
            try {
              const result = await readWithEncoding(file, encoding);
              return result;
            } catch (error) {
              devError(`파일 읽기 실패: ${error}`);
              continue;
            }
          }
        }
        throw error;
      }
    } catch (error) {
      throw new Error(
        `파일을 읽을 수 없습니다. 파일이 손상되었거나 지원하지 않는 형식일 수 있습니다. ${error}`
      );
    }
  };

  // 텍스트 입력창 변경 처리
  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'inherit';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // 파일 선택 처리
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileType = file.type;
      if (
        fileType === 'image/jpeg' ||
        fileType === 'image/png' ||
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
        setAttachedFile(file);
        if (/(\.jpe?g|\.png)$/i.test(file.name)) {
          // 이미지 파일이면 미리보기 생성
          const url = URL.createObjectURL(file);
          setFilePreviewUrl(url);
        } else {
          setFilePreviewUrl(null);
        }
      } else {
        alert(
          '지원되는 파일 형식: txt, csv, xlsx, xls, pdf, jpg, jpeg, png, heic, heif'
        );
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setFilePreviewUrl(null);
      }
    }
  };

  // 파일 제거 처리
  const removeAttachedFile = () => {
    setAttachedFile(null);
    setFilePreviewUrl(null);
    setActiveButton(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    // 버튼이나 다른 인터랙티브 요소가 아닌 경우에만 textarea 포커스
    if (e.target === e.currentTarget && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className='max-w-9xl mx-auto'>
      {attachedFile && (
        <div className='mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-between gap-2'>
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
            onClick={removeAttachedFile}
            className='text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          >
            <X className='w-4 h-4' />
          </button>
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
        accept='text/plain,text/csv,application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,image/jpeg,image/png,.txt,.csv,.pdf,.xlsx,.xls,.jpg,.jpeg,.png'
      />
    </form>
  );
};

export default ChatInput;
