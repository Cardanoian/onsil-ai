# Gemini API generateContent Config 파라미터 가이드

Google Gemini API의 `generateContent` 메서드에서 사용할 수 있는 `config` 객체의 모든 파라미터를 상세히 설명합니다.

## 목차

- [응답 형식 제어](#응답-형식-제어)
- [출력 제어 파라미터](#출력-제어-파라미터)
- [안전 및 콘텐츠 필터링](#안전-및-콘텐츠-필터링)
- [고급 제어 파라미터](#고급-제어-파라미터)
- [구조화된 출력](#구조화된-출력)
- [음성 관련 파라미터](#음성-관련-파라미터)
- [사고 과정 제어](#사고-과정-제어)
- [시스템 및 도구](#시스템-및-도구)
- [캐싱 및 최적화](#캐싱-및-최적화)
- [요청 관리](#요청-관리)

---

## 응답 형식 제어

### responseModalities

- **타입**: `string[]`
- **설명**: 모델이 생성할 응답의 형식을 지정합니다.
- **가능한 값**: `['TEXT']`, `['IMAGE']`, `['AUDIO']`, `['TEXT', 'IMAGE']` 등
- **기본값**: `['TEXT']`

**예시**:

```typescript
// 텍스트 응답
config: {
  responseModalities: ['TEXT'];
}

// 이미지 생성
config: {
  responseModalities: ['IMAGE'];
}

// 오디오 생성
config: {
  responseModalities: ['AUDIO'];
}

// 멀티모달 응답 (텍스트 + 이미지)
config: {
  responseModalities: ['TEXT', 'IMAGE'];
}
```

### responseMimeType

- **타입**: `string`
- **설명**: 응답의 MIME 타입을 지정합니다.
- **가능한 값**: `'text/plain'`, `'application/json'`, `'image/png'`, `'audio/mp3'` 등
- **기본값**: `'text/plain'`

**예시**:

```typescript
// JSON 형식 응답
config: {
  responseMimeType: 'application/json';
}

// 일반 텍스트
config: {
  responseMimeType: 'text/plain';
}
```

### mediaResolution

- **타입**: `MediaResolution`
- **설명**: 미디어 출력의 해상도를 설정합니다.
- **가능한 값**: 모델에 따라 다름 (예: `'low'`, `'medium'`, `'high'`)

**예시**:

```typescript
config: {
  mediaResolution: 'high',
  responseModalities: ['IMAGE']
}
```

---

## 출력 제어 파라미터

### maxOutputTokens

- **타입**: `number`
- **설명**: 생성할 최대 토큰 수를 제한합니다.
- **기본값**: 모델마다 다름 (일반적으로 2048-8192)
- **범위**: 1 ~ 모델의 최대 토큰 수

**예시**:

```typescript
// 짧은 응답 생성 (약 150 단어)
config: {
  maxOutputTokens: 200;
}

// 긴 응답 생성 (약 750 단어)
config: {
  maxOutputTokens: 1000;
}

// 매우 긴 응답 (약 6000 단어)
config: {
  maxOutputTokens: 8192;
}
```

### temperature

- **타입**: `number`
- **설명**: 응답의 무작위성/창의성을 조절합니다.
- **범위**: 0.0 ~ 2.0
- **기본값**: 1.0
- **효과**:
  - 낮을수록 (0.0에 가까울수록): 일관성 있고 예측 가능한 응답
  - 높을수록 (2.0에 가까울수록): 창의적이고 다양한 응답

**예시**:

```typescript
// 매우 일관적인 응답 (코드 생성, 정확한 정보 필요 시)
config: {
  temperature: 0.0;
}

// 균형잡힌 응답 (일반적인 대화)
config: {
  temperature: 1.0;
}

// 창의적인 응답 (스토리텔링, 브레인스토밍)
config: {
  temperature: 1.5;
}

// 매우 창의적이고 예측 불가능한 응답
config: {
  temperature: 2.0;
}
```

### topK

- **타입**: `number`
- **설명**: 샘플링할 상위 K개의 토큰만 고려합니다.
- **기본값**: 40
- **범위**: 1 ~ infinity
- **효과**: 낮을수록 더 집중된 응답, 높을수록 더 다양한 응답

**예시**:

```typescript
// 매우 집중된 응답 (상위 10개 토큰만 고려)
config: {
  topK: 10,
  temperature: 0.8
}

// 기본 설정
config: {
  topK: 40
}

// 더 다양한 응답
config: {
  topK: 100,
  temperature: 1.2
}
```

### topP

- **타입**: `number`
- **설명**: Nucleus sampling - 누적 확률이 P에 도달할 때까지의 토큰만 고려합니다.
- **범위**: 0.0 ~ 1.0
- **기본값**: 0.95
- **효과**: 낮을수록 더 집중된 응답, 높을수록 더 다양한 응답

**예시**:

```typescript
// 매우 집중된 응답 (상위 50% 확률까지만)
config: {
  topP: 0.5,
  temperature: 0.7
}

// 균형잡힌 응답
config: {
  topP: 0.9
}

// 더 다양한 응답 (거의 모든 토큰 고려)
config: {
  topP: 0.99
}
```

### candidateCount

- **타입**: `number`
- **설명**: 생성할 후보 응답의 개수입니다.
- **기본값**: 1
- **범위**: 1 ~ 8 (모델에 따라 다름)

**예시**:

```typescript
// 하나의 응답만 생성
config: {
  candidateCount: 1
}

// 여러 후보 중 선택 (A/B 테스트 등)
config: {
  candidateCount: 3,
  temperature: 0.8
}
```

### stopSequences

- **타입**: `string[]`
- **설명**: 지정된 시퀀스가 나타나면 생성을 중단합니다.
- **기본값**: `[]`

**예시**:

````typescript
// 특정 마커에서 중단
config: {
  stopSequences: ['END', '---', '###'];
}

// 대화 종료 감지
config: {
  stopSequences: ['사용자:', 'User:', 'Q:', 'A:'];
}

// 코드 블록 종료 감지
config: {
  stopSequences: ['```', '</code>'];
}
````

---

## 안전 및 콘텐츠 필터링

### safetySettings

- **타입**: `SafetySetting[]`
- **설명**: 유해 콘텐츠 필터링 설정을 지정합니다.
- **카테고리**:
  - `HARM_CATEGORY_HATE_SPEECH`: 증오 발언
  - `HARM_CATEGORY_SEXUALLY_EXPLICIT`: 성적으로 노골적인 콘텐츠
  - `HARM_CATEGORY_DANGEROUS_CONTENT`: 위험한 콘텐츠
  - `HARM_CATEGORY_HARASSMENT`: 괴롭힘
- **임계값**:
  - `BLOCK_NONE`: 차단 안 함
  - `BLOCK_ONLY_HIGH`: 높은 위험만 차단
  - `BLOCK_MEDIUM_AND_ABOVE`: 중간 이상 차단
  - `BLOCK_LOW_AND_ABOVE`: 낮은 수준부터 차단

**예시**:

```typescript
// 엄격한 필터링 (교육용 앱)
config: {
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_HARASSMENT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ];
}

// 중간 수준 필터링
config: {
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ];
}

// 최소 필터링 (성인용, 연구 목적)
config: {
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_ONLY_HIGH',
    },
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_ONLY_HIGH',
    },
  ];
}
```

---

## 고급 제어 파라미터

### frequencyPenalty

- **타입**: `number`
- **설명**: 이미 등장한 토큰의 재사용을 제어합니다.
- **범위**: -2.0 ~ 2.0
- **효과**:
  - 양수: 반복 감소 (새로운 표현 장려)
  - 0: 영향 없음
  - 음수: 반복 증가 (일관성 있는 용어 사용)

**예시**:

```typescript
// 반복 최소화 (다양한 표현 사용)
config: {
  frequencyPenalty: 1.0,
  temperature: 0.8
}

// 기본 설정
config: {
  frequencyPenalty: 0.0
}

// 일관된 용어 사용 (기술 문서)
config: {
  frequencyPenalty: -0.5
}

// 매우 다양한 표현 (창작물)
config: {
  frequencyPenalty: 2.0
}
```

### presencePenalty

- **타입**: `number`
- **설명**: 새로운 주제 등장을 장려합니다.
- **범위**: -2.0 ~ 2.0
- **효과**:
  - 양수: 새로운 주제 장려
  - 0: 영향 없음
  - 음수: 기존 주제에 집중

**예시**:

```typescript
// 새로운 주제 탐색 (브레인스토밍)
config: {
  presencePenalty: 1.5,
  temperature: 1.2
}

// 균형잡힌 설정
config: {
  presencePenalty: 0.0
}

// 한 주제에 집중 (심층 분석)
config: {
  presencePenalty: -1.0
}
```

### seed

- **타입**: `number`
- **설명**: 재현 가능한 결과를 위한 랜덤 시드입니다.
- **범위**: 임의의 정수
- **효과**: 같은 시드 값을 사용하면 동일한 입력에 대해 일관된 응답을 얻을 수 있습니다.

**예시**:

```typescript
// 테스트/디버깅용 (항상 같은 결과)
config: {
  seed: 42,
  temperature: 0.7
}

// A/B 테스트 (각 그룹마다 일관된 응답)
config: {
  seed: 12345,
  temperature: 0.8
}

// 프로덕션에서 재현 가능한 결과
config: {
  seed: Date.now(), // 요청 시점의 타임스탬프 사용
  temperature: 1.0
}
```

### logprobs

- **타입**: `number`
- **설명**: 반환할 로그 확률의 개수입니다.
- **용도**: 모델의 확신도 분석, 디버깅

**예시**:

```typescript
// 상위 5개 토큰의 확률 반환
config: {
  logprobs: 5,
  responseLogprobs: true
}

// 모델 확신도 분석
config: {
  logprobs: 10,
  responseLogprobs: true,
  temperature: 0.0
}
```

### responseLogprobs

- **타입**: `boolean`
- **설명**: 응답에 로그 확률을 포함할지 여부입니다.
- **기본값**: `false`

**예시**:

```typescript
// 로그 확률 포함
config: {
  responseLogprobs: true,
  logprobs: 5
}
```

---

## 구조화된 출력

### responseSchema

- **타입**: `unknown` (JSON Schema 객체)
- **설명**: 응답이 따라야 할 스키마를 정의합니다.
- **용도**: 구조화된 데이터 추출

**예시**:

```typescript
// 사용자 정보 추출
config: {
  responseSchema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
      email: { type: 'string', format: 'email' }
    },
    required: ['name', 'email']
  },
  responseMimeType: 'application/json'
}

// 제품 목록 추출
config: {
  responseSchema: {
    type: 'object',
    properties: {
      products: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            inStock: { type: 'boolean' }
          }
        }
      }
    }
  },
  responseMimeType: 'application/json'
}

// 감정 분석 결과
config: {
  responseSchema: {
    type: 'object',
    properties: {
      sentiment: {
        type: 'string',
        enum: ['positive', 'negative', 'neutral']
      },
      confidence: {
        type: 'number',
        minimum: 0,
        maximum: 1
      },
      keywords: {
        type: 'array',
        items: { type: 'string' }
      }
    }
  },
  responseMimeType: 'application/json'
}
```

### responseJsonSchema

- **타입**: `unknown`
- **설명**: `responseSchema`의 별칭, 더 명시적인 이름입니다.

**예시**:

```typescript
config: {
  responseJsonSchema: {
    type: 'object',
    properties: {
      answer: { type: 'string' },
      confidence: { type: 'number' }
    }
  }
}
```

---

## 음성 관련 파라미터

### speechConfig

- **타입**: `SpeechConfigUnion`
- **설명**: 음성 합성(TTS) 설정을 지정합니다.
- **구성 요소**:
  - `voiceConfig`: 단일 화자 설정
  - `multiSpeakerVoiceConfig`: 다중 화자 설정

**예시**:

```typescript
// 단일 화자 TTS
config: {
  responseModalities: ['AUDIO'],
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: 'Kore'  // 여성 목소리
      }
    }
  }
}

// 다중 화자 대화
config: {
  responseModalities: ['AUDIO'],
  speechConfig: {
    multiSpeakerVoiceConfig: {
      speakerVoiceConfigs: [
        {
          speaker: 'Alice',
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Zephyr' }
          }
        },
        {
          speaker: 'Bob',
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Charon' }
          }
        }
      ]
    }
  }
}

// 커스텀 음성 속성
config: {
  responseModalities: ['AUDIO'],
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: 'Aoede'
      }
    }
  }
}
```

### audioTimestamp

- **타입**: `boolean`
- **설명**: 오디오 응답에 타임스탬프를 포함할지 여부입니다.
- **기본값**: `false`

**예시**:

```typescript
// 타임스탬프 포함 (자막 생성용)
config: {
  responseModalities: ['AUDIO'],
  audioTimestamp: true,
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: { voiceName: 'Kore' }
    }
  }
}
```

---

## 사고 과정 제어

### thinkingConfig

- **타입**: `ThinkingConfig`
- **설명**: 모델의 "사고 과정"을 제어합니다.
- **속성**:
  - `thinkingBudget`: 사고 과정에 할당할 토큰 수 (0이면 사고 과정 비활성화)

**예시**:

```typescript
// 사고 과정 비활성화 (빠른 응답)
config: {
  thinkingConfig: {
    thinkingBudget: 0
  }
}

// 간단한 사고 과정 (복잡한 문제)
config: {
  thinkingConfig: {
    thinkingBudget: 1000
  }
}

// 깊은 사고 과정 (매우 복잡한 추론)
config: {
  thinkingConfig: {
    thinkingBudget: 5000
  },
  maxOutputTokens: 8192
}

// 수학 문제 해결
config: {
  thinkingConfig: {
    thinkingBudget: 2000
  },
  temperature: 0.3  // 정확성 중시
}
```

---

## 시스템 및 도구

### systemInstruction

- **타입**: `ContentUnion` (string 또는 Content 객체)
- **설명**: 모델의 역할과 행동을 정의하는 시스템 지시사항입니다.

**예시**:

```typescript
// 간단한 역할 정의
config: {
  systemInstruction: '당신은 친절한 고객 서비스 AI입니다.'
}

// 상세한 역할 정의
config: {
  systemInstruction: `당신은 전문 프로그래밍 튜터입니다.
규칙:
1. 코드 예시를 항상 제공하세요
2. 초보자도 이해할 수 있게 설명하세요
3. 모범 사례를 강조하세요
4. 긍정적이고 격려하는 톤을 유지하세요`
}

// 캐릭터 페르소나
config: {
  systemInstruction: {
    role: 'system',
    parts: [{
      text: '당신은 18세기 해적 선장입니다. 해적 말투를 사용하되, 정확한 정보를 제공하세요.'
    }]
  }
}
```

### tools

- **타입**: `ToolListUnion`
- **설명**: 모델이 사용할 수 있는 함수/도구를 정의합니다.

**예시**:

```typescript
// 날씨 조회 도구
config: {
  tools: [
    {
      functionDeclarations: [
        {
          name: 'get_weather',
          description: '특정 도시의 현재 날씨를 조회합니다',
          parameters: {
            type: 'object',
            properties: {
              city: {
                type: 'string',
                description: '날씨를 조회할 도시 이름',
              },
              unit: {
                type: 'string',
                enum: ['celsius', 'fahrenheit'],
                description: '온도 단위',
              },
            },
            required: ['city'],
          },
        },
      ],
    },
  ];
}

// 여러 도구 제공
config: {
  tools: [
    {
      functionDeclarations: [
        {
          name: 'search_database',
          description: '데이터베이스에서 정보를 검색합니다',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
          },
        },
        {
          name: 'send_email',
          description: '이메일을 전송합니다',
          parameters: {
            type: 'object',
            properties: {
              to: { type: 'string', format: 'email' },
              subject: { type: 'string' },
              body: { type: 'string' },
            },
          },
        },
      ],
    },
  ];
}
```

### toolConfig

- **타입**: `ToolConfig`
- **설명**: 도구 사용 방식을 설정합니다.
- **모드**:
  - `AUTO`: 모델이 자동으로 도구 사용 결정
  - `ANY`: 항상 도구 사용 (특정 도구 지정 가능)
  - `NONE`: 도구 사용 안 함

**예시**:

```typescript
// 자동 도구 선택
config: {
  tools: [/* ... */],
  toolConfig: {
    functionCallingConfig: {
      mode: 'AUTO'
    }
  }
}

// 특정 도구만 사용
config: {
  tools: [/* ... */],
  toolConfig: {
    functionCallingConfig: {
      mode: 'ANY',
      allowedFunctionNames: ['get_weather', 'search_database']
    }
  }
}

// 도구 사용 안 함
config: {
  tools: [/* ... */],
  toolConfig: {
    functionCallingConfig: {
      mode: 'NONE'
    }
  }
}
```

### automaticFunctionCalling

- **타입**: `AutomaticFunctionCallingConfig`
- **설명**: 자동 함수 호출 설정입니다.

**예시**:

```typescript
// 자동 함수 호출 활성화
config: {
  tools: [/* ... */],
  automaticFunctionCalling: {
    disable: false,
    maxIterations: 5  // 최대 반복 횟수
  }
}

// 자동 함수 호출 비활성화
config: {
  tools: [/* ... */],
  automaticFunctionCalling: {
    disable: true
  }
}
```

---

## 캐싱 및 최적화

### cachedContent

- **타입**: `string`
- **설명**: 캐시된 컨텍스트의 ID입니다.
- **용도**: 반복적인 긴 컨텍스트 사용 시 비용 절감

**예시**:

```typescript
// 캐시된 문서 사용
config: {
  cachedContent: 'cached-content-id-12345';
}

// 긴 시스템 프롬프트 캐싱
// 먼저 캐시 생성
const cache = await ai.caches.create({
  model: 'gemini-2.5-flash',
  contents: longSystemPrompt,
  ttl: '3600s', // 1시간
});

// 이후 요청에서 캐시 사용
config: {
  cachedContent: cache.name;
}
```

### modelSelectionConfig

- **타입**: `ModelSelectionConfig`
- **설명**: 모델 선택 설정입니다.

**예시**:

```typescript
config: {
  modelSelectionConfig: {
    preferredModel: 'gemini-2.5-flash',
    fallbackModel: 'gemini-2.0-flash'
  }
}
```

### routingConfig

- **타입**: `GenerationConfigRoutingConfig`
- **설명**: 요청 라우팅 설정입니다.

---

## 요청 관리

### abortSignal

- **타입**: `AbortSignal`
- **설명**: 요청을 취소할 수 있는 시그널입니다.

**예시**:

```typescript
// 타임아웃 설정
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000); // 30초

config: {
  abortSignal: controller.signal;
}

// 사용자 취소 버튼
const controller = new AbortController();

// 취소 버튼 핸들러
cancelButton.onclick = () => controller.abort();

const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: 'Long running task...',
  config: {
    abortSignal: controller.signal,
  },
});
```

### httpOptions

- **타입**: `HttpOptions`
- **설명**: HTTP 요청 커스터마이징 옵션입니다.
- **속성**: 헤더, 타임아웃, 리트라이 정책 등

**예시**:

```typescript
config: {
  httpOptions: {
    headers: {
      'X-Custom-Header': 'value'
    },
    timeout: 60000,  // 60초
    retry: {
      maxAttempts: 3,
      backoff: 'exponential'
    }
  }
}
```

### labels

- **타입**: `Record<string, string>`
- **설명**: 요청에 대한 커스텀 라벨입니다.
- **용도**: 로깅, 추적, 분석

**예시**:

```typescript
config: {
  labels: {
    environment: 'production',
    userId: 'user-123',
    feature: 'chat',
    version: '2.0'
  }
}

// A/B 테스트
config: {
  labels: {
    experimentId: 'exp-456',
    variant: 'B',
    cohort: 'premium-users'
  }
}
```

---

## 종합 예시

### 1. 교육용 챗봇

```typescript
const config = {
  systemInstruction: '당신은 친절한 수학 선생님입니다.',
  temperature: 0.7,
  maxOutputTokens: 1000,
  topP: 0.9,
  safetySettings: [
    {
      category: 'HARM_CATEGORY_HATE_SPEECH',
      threshold: 'BLOCK_LOW_AND_ABOVE',
    },
  ],
  thinkingConfig: {
    thinkingBudget: 1000,
  },
};
```

### 2. 창의적 글쓰기 도우미

```typescript
const config = {
  systemInstruction:
    '당신은 창의적인 작가입니다. 독창적이고 흥미로운 이야기를 만들어주세요.',
  temperature: 1.5,
  maxOutputTokens: 2048,
  topP: 0.95,
  topK: 100,
  frequencyPenalty: 1.0,
  presencePenalty: 1.2,
};
```

### 3. 코드 생성 및 리뷰

````typescript
const config = {
  systemInstruction:
    '당신은 시니어 소프트웨어 엔지니어입니다. 깔끔하고 효율적인 코드를 작성하세요.',
  temperature: 0.2,
  maxOutputTokens: 4096,
  topP: 0.8,
  topK: 10,
  frequencyPenalty: -0.5, // 일관된 코딩 스타일
  stopSequences: ['```\n\n', '---END---'],
};
````

### 4. 데이터 분석 및 구조화된 출력

```typescript
const config = {
  temperature: 0.3,
  responseSchema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      insights: {
        type: 'array',
        items: { type: 'string' },
      },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            priority: { type: 'string', enum: ['high', 'medium', 'low'] },
            description: { type: 'string' },
          },
        },
      },
    },
  },
  responseMimeType: 'application/json',
};
```

### 5. 이미지 생성

```typescript
const config = {
  responseModalities: ['IMAGE'],
  temperature: 0.8,
  seed: 42, // 재현 가능한 결과
  safetySettings: [
    {
      category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
      threshold: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ],
};
```

### 6. 음성 합성 (TTS)

```typescript
const config = {
  responseModalities: ['AUDIO'],
  audioTimestamp: true,
  speechConfig: {
    voiceConfig: {
      prebuiltVoiceConfig: {
        voiceName: 'Kore',
      },
    },
  },
};
```

### 7. 함수 호출을 사용하는 AI 에이전트

```typescript
const config = {
  systemInstruction:
    '당신은 도움을 주는 AI 비서입니다. 필요한 경우 제공된 도구를 사용하세요.',
  temperature: 0.7,
  tools: [
    {
      functionDeclarations: [
        {
          name: 'get_current_weather',
          description: '특정 위치의 현재 날씨를 가져옵니다',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: '도시 이름',
              },
            },
            required: ['location'],
          },
        },
        {
          name: 'search_web',
          description: '웹에서 정보를 검색합니다',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string' },
            },
            required: ['query'],
          },
        },
      ],
    },
  ],
  toolConfig: {
    functionCallingConfig: {
      mode: 'AUTO',
    },
  },
  automaticFunctionCalling: {
    disable: false,
    maxIterations: 5,
  },
};
```

### 8. 긴 컨텍스트를 사용하는 문서 분석

```typescript
const config = {
  cachedContent: 'cached-long-document-id',
  temperature: 0.5,
  maxOutputTokens: 2048,
  thinkingConfig: {
    thinkingBudget: 2000, // 복잡한 추론 필요
  },
};
```

---

## 마치며

이 문서는 Gemini API의 `generateContent` 메서드에서 사용할 수 있는 주요 파라미터들을 다룹니다. 실제 사용 시에는:

1. **시작은 간단하게**: 기본 설정(`temperature`, `maxOutputTokens`)부터 시작하세요
2. **점진적 조정**: 결과를 보면서 필요한 파라미터를 추가하세요
3. **비용 고려**: `maxOutputTokens`, `thinkingBudget`, `cachedContent` 등은 비용에 영향을 줍니다
4. **안전성 우선**: 프로덕션 환경에서는 `safetySettings`를 적절히 설정하세요
5. **테스트**: `seed`를 사용해 재현 가능한 테스트를 수행하세요

더 자세한 정보는 [Google Gemini API 공식 문서](https://ai.google.dev/docs)를 참고하세요.
