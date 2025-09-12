import React, { useEffect } from 'react';
import {
  X,
  MessageCircle,
  FileText,
  Image,
  Volume2,
  Lightbulb,
} from 'lucide-react';

interface HowToProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowTo: React.FC<HowToProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      {/* 배경 오버레이 */}
      <div
        className='absolute inset-0 bg-black bg-opacity-50 transition-opacity'
        onClick={onClose}
      />

      {/* 모달 창 */}
      <div className='relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col'>
        {/* 헤더 - 고정 */}
        <div className='flex-none flex items-center justify-between p-6 border-b dark:border-gray-700'>
          <div></div>
          <div className='flex items-center gap-3'>
            <img src='/gbept.png' alt='온실이AI' className='h-8 w-8' />
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
              온실이AI 사용방법
            </h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* 내용 - 스크롤 가능 */}
        <div className='flex-1 overflow-y-auto scrollbar-custom p-6 space-y-6'>
          {/* 소개 */}
          <div className='text-center'>
            <p className='text-lg text-gray-700 dark:text-gray-300'>
              온실이AI는 다양한 방식으로 대화할 수 있는 AI 어시스턴트입니다.
            </p>
          </div>

          {/* 주요 기능들 */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2'>
              <Lightbulb className='w-5 h-5 text-yellow-500' />
              주요 기능
            </h3>

            <div className='grid gap-4'>
              {/* 텍스트 채팅 */}
              <div className='flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <MessageCircle className='w-6 h-6 text-blue-500 mt-1' />
                <div>
                  <h4 className='font-semibold text-gray-900 dark:text-white'>
                    텍스트 채팅
                  </h4>
                  <p className='text-gray-600 dark:text-gray-300'>
                    하단 입력창에 질문이나 요청사항을 입력하고 전송 버튼을
                    누르거나 Enter 키를 눌러 대화하세요.
                  </p>
                </div>
              </div>

              {/* 파일 업로드 */}
              <div className='flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <FileText className='w-6 h-6 text-green-500 mt-1' />
                <div>
                  <h4 className='font-semibold text-gray-900 dark:text-white'>
                    파일 업로드
                  </h4>
                  <p className='text-gray-600 dark:text-gray-300'>
                    클립 버튼을 눌러 이미지나 문서 파일을 업로드하고 AI에게
                    분석을 요청할 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 이미지 생성 */}
              <div className='flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <Image className='w-6 h-6 text-purple-500 mt-1' />
                <div>
                  <h4 className='font-semibold text-gray-900 dark:text-white'>
                    이미지 생성
                  </h4>
                  <p className='text-gray-600 dark:text-gray-300'>
                    텍스트 프롬프트를 입력하여 AI가 이미지를 생성하도록 요청할
                    수 있습니다.
                  </p>
                </div>
              </div>

              {/* 음성 생성 */}
              <div className='flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg'>
                <Volume2 className='w-6 h-6 text-orange-500 mt-1' />
                <div>
                  <h4 className='font-semibold text-gray-900 dark:text-white'>
                    음성 생성
                  </h4>
                  <p className='text-gray-600 dark:text-gray-300'>
                    프롬프트를 입력하면 AI가 어울리는 대본을 자동으로 생성하고
                    자연스러운 음성으로 변환해드립니다.
                    <br /> (이 기능은 몇 분 정도 걸릴 수 있습니다.)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 사용 팁 */}
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
              💡 사용 팁
            </h3>
            <div className='space-y-2 text-gray-600 dark:text-gray-300'>
              <p>
                • 구체적이고 명확한 질문을 하면 더 정확한 답변을 받을 수
                있습니다.
              </p>
              <p>
                • 긴 대화가 필요한 경우 맥락을 유지하며 단계별로 질문해보세요.
              </p>
              <p>
                • 우상단의 휴지통 버튼으로 대화 내역을 초기화할 수 있습니다.
              </p>
              <p>
                • 다크/라이트 테마는 우상단의 테마 버튼으로 변경 가능합니다.
              </p>
            </div>
          </div>

          {/* 주의사항 */}
          <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4'>
            <h3 className='text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2'>
              ⚠️ 주의사항
            </h3>
            <div className='text-yellow-700 dark:text-yellow-300 space-y-1 text-sm'>
              <p>
                • AI의 답변이 항상 정확하지 않을 수 있으니 중요한 결정은 신중히
                하세요.
              </p>
              <p>• 개인정보나 민감한 정보는 입력하지 마세요.</p>
              <p>
                • 생성된 이미지나 음성은 저작권 등 법적 문제를 고려하여
                사용하세요.
              </p>
              <p>
                • 음성생성 기능은 아직 테스트버전으로 목소리에 문제가 있을 수
                있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
