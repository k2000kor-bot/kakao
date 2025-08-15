import React, { useState } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  LightBulbIcon,
  SparklesIcon,
  EyeIcon,
  TagIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { FileAnalysisResult } from '../services/fileAnalysisService';

interface AdvancedAnalysisVisualizationProps {
  analysisResult: FileAnalysisResult;
  isVisible: boolean;
  onClose: () => void;
}

const AdvancedAnalysisVisualization: React.FC<AdvancedAnalysisVisualizationProps> = ({
  analysisResult,
  isVisible,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'insights' | 'visual'>('overview');

  if (!isVisible) return null;

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <PhotoIcon className="w-6 h-6 text-green-500" />;
      case 'video':
        return <VideoCameraIcon className="w-6 h-6 text-red-500" />;
      case 'audio':
        return <MusicalNoteIcon className="w-6 h-6 text-purple-500" />;
      case 'document':
        return <DocumentTextIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <DocumentTextIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center space-x-3 mb-4">
          {getFileTypeIcon(analysisResult.analysisType)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{analysisResult.fileName}</h3>
            <p className="text-sm text-gray-500">{analysisResult.analysisType} 분석 결과</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getConfidenceColor(analysisResult.confidence)}`}>
              {analysisResult.confidence}%
            </div>
            <div className="text-sm text-gray-600">신뢰도</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {analysisResult.processingTime}ms
            </div>
            <div className="text-sm text-gray-600">처리시간</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {analysisResult.keywords.length}
            </div>
            <div className="text-sm text-gray-600">키워드</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {analysisResult.insights.length}
            </div>
            <div className="text-sm text-gray-600">인사이트</div>
          </div>
        </div>
      </div>

      {/* 요약 및 키워드 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
            분석 요약
          </h4>
          <p className="text-gray-700 leading-relaxed">{analysisResult.summary}</p>
        </div>

        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TagIcon className="w-5 h-5 mr-2 text-purple-600" />
            주요 키워드
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysisResult.keywords.map((keyword, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      {/* 상세 분석 결과 */}
      {analysisResult.detailedAnalysis && (
        <>
          {/* 엔티티 분석 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <EyeIcon className="w-5 h-5 mr-2 text-green-600" />
              엔티티 분석
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.detailedAnalysis.entities.map((entity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium text-gray-900">{entity.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({entity.type})</span>
                  </div>
                  <span className="text-sm font-medium text-blue-600">{entity.confidence}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* 감정 분석 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
              감정 분석
            </h4>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSentimentColor(analysisResult.detailedAnalysis.sentiment.overall)}`}>
                {analysisResult.detailedAnalysis.sentiment.overall === 'positive' ? '긍정적' :
                 analysisResult.detailedAnalysis.sentiment.overall === 'negative' ? '부정적' : '중립적'}
              </span>
              <span className="text-sm text-gray-600">
                점수: {Math.round(analysisResult.detailedAnalysis.sentiment.score * 100)}%
              </span>
            </div>
          </div>

          {/* 주제 분석 */}
          <div className="bg-white rounded-lg border p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600" />
              주제 분석
            </h4>
            <div className="space-y-3">
              {analysisResult.detailedAnalysis.topics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{topic.name}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${topic.weight * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{Math.round(topic.weight * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 문서 구조 */}
          {analysisResult.detailedAnalysis.structure && (
            <div className="bg-white rounded-lg border p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                문서 구조
              </h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">제목 구조</h5>
                  <div className="space-y-1">
                    {analysisResult.detailedAnalysis.structure.headings.map((heading, index) => (
                      <div key={index} className="text-sm text-gray-700 pl-4">
                        {index + 1}. {heading}
                      </div>
                    ))}
                  </div>
                </div>
                {analysisResult.detailedAnalysis.structure.tables.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">테이블 정보</h5>
                    <div className="text-sm text-gray-600">
                      {analysisResult.detailedAnalysis.structure.tables.length}개의 테이블이 감지되었습니다.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* 시각적 분석 결과 */}
      {analysisResult.visualAnalysis && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PhotoIcon className="w-5 h-5 mr-2 text-green-600" />
            시각적 분석
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">감지된 객체</h5>
              <div className="space-y-2">
                {analysisResult.visualAnalysis.objects.map((object, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{object.name}</span>
                    <span className="text-sm font-medium text-blue-600">{object.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-3">추출된 텍스트</h5>
              <div className="space-y-2">
                {analysisResult.visualAnalysis.text.map((text, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded">
                    <div className="text-sm text-gray-700">{text.content}</div>
                    <div className="text-xs text-gray-500 mt-1">신뢰도: {text.confidence}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <h5 className="font-medium text-gray-900 mb-2">장면 분류</h5>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {analysisResult.visualAnalysis.scene}
            </span>
          </div>
        </div>
      )}

      {/* 오디오 분석 결과 */}
      {analysisResult.audioAnalysis && (
        <div className="bg-white rounded-lg border p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MusicalNoteIcon className="w-5 h-5 mr-2 text-purple-600" />
            오디오 분석
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-medium text-gray-900 mb-3">음성 인식</h5>
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-700">{analysisResult.audioAnalysis.transcription}</p>
                <div className="text-xs text-gray-500 mt-2">
                  언어: {analysisResult.audioAnalysis.language}
                </div>
              </div>
            </div>
            <div>
              <h5 className="font-medium text-gray-900 mb-3">화자 정보</h5>
              <div className="space-y-2">
                {analysisResult.audioAnalysis.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">화자 {speaker.id}</span>
                    <span className="text-sm font-medium text-blue-600">{speaker.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderInsights = () => (
    <div className="space-y-6">
      {/* 인사이트 목록 */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
          분석 인사이트
        </h4>
        <div className="space-y-4">
          {analysisResult.insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <LightBulbIcon className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 추천사항 */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SparklesIcon className="w-5 h-5 mr-2 text-indigo-600" />
          추천사항
        </h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 font-medium">데이터 검증</p>
              <p className="text-sm text-gray-600">분석 결과의 정확성을 검증하세요.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 font-medium">추가 분석</p>
              <p className="text-sm text-gray-600">관련 파일들과 함께 종합 분석을 진행하세요.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
            <SparklesIcon className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-700 font-medium">문서화</p>
              <p className="text-sm text-gray-600">분석 결과를 프로젝트 문서에 기록하세요.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVisual = () => (
    <div className="space-y-6">
      {/* 신뢰도 차트 */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ChartBarIcon className="w-5 h-5 mr-2 text-blue-600" />
          신뢰도 분석
        </h4>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">전체 신뢰도</span>
            <span className="text-sm font-medium text-gray-900">{analysisResult.confidence}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${analysisResult.confidence >= 90 ? 'bg-green-500' : 
                analysisResult.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
              style={{ width: `${analysisResult.confidence}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500">
            {analysisResult.confidence >= 90 ? '매우 높음' :
             analysisResult.confidence >= 70 ? '높음' : '낮음'}
          </div>
        </div>
      </div>

      {/* 처리 시간 분석 */}
      <div className="bg-white rounded-lg border p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ClockIcon className="w-5 h-5 mr-2 text-orange-600" />
          성능 분석
        </h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{analysisResult.processingTime}ms</div>
            <div className="text-sm text-gray-600">처리 시간</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{analysisResult.keywords.length}</div>
            <div className="text-sm text-gray-600">추출 키워드</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">고급 분석 시각화</h3>
              <p className="text-sm text-gray-500">상세한 분석 결과 및 인사이트</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            title="닫기"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', name: '개요', icon: EyeIcon },
              { id: 'details', name: '상세 분석', icon: DocumentTextIcon },
              { id: 'insights', name: '인사이트', icon: LightBulbIcon },
              { id: 'visual', name: '시각화', icon: ChartBarIcon }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'details' && renderDetails()}
          {activeTab === 'insights' && renderInsights()}
          {activeTab === 'visual' && renderVisual()}
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalysisVisualization;
