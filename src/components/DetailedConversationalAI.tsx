import React, { useState, useCallback } from 'react';

interface DetailedResponse {
  mainResponse: string;
  detailedExplanation: string;
  examples: string[];
  confidence: number;
}

const DetailedConversationalAI = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  // 디테일한 대화형 응답 생성
  const generateDetailedResponse = useCallback(async (
    userInput: string, 
    analysisResult: any, 
    analysisType: string
  ): Promise<DetailedResponse> => {
    setIsGenerating(true);

    try {
      const mainResponse = generateMainResponse(userInput, analysisResult, analysisType);
      const detailedExplanation = generateDetailedExplanation(analysisResult, analysisType);
      const examples = generateExamples(analysisResult, analysisType);
      const confidence = calculateConfidence(analysisResult, analysisType);

      return {
        mainResponse,
        detailedExplanation,
        examples,
        confidence
      };

    } catch (error) {
      console.error('상세 응답 생성 오류:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // 메인 응답 생성
  const generateMainResponse = useCallback((userInput: string, analysisResult: any, analysisType: string): string => {
    switch (analysisType) {
      case 'personality':
        return `분석 결과를 말씀드리겠습니다. 정말 흥미로운 결과가 나왔네요! 의사소통 스타일과 감정 인식 능력이 특히 뛰어나게 나타났습니다.`;
      case 'construction_bias':
        return `시공사 성향 분석이 완료되었습니다. 상당히 세밀한 분석이 가능했습니다. 대우건설에 대한 긍정적 성향이 가장 강하게 나타났습니다.`;
      case 'kakao_chat':
        return `카카오톡 대화 분석 결과입니다. 팀워크가 정말 좋아 보이네요! 전반적으로 긍정적인 분위기에서 활발한 소통이 이루어지고 있습니다.`;
      case 'public_opinion':
        return `여론 분석 결과를 알려드리겠습니다. 체계적인 분석을 통해 투명성과 비용 효율성이 주요 관심사로 나타났습니다.`;
      default:
        return `분석이 완료되었습니다. 상세한 결과를 확인해보세요.`;
    }
  }, []);

  // 상세 설명 생성
  const generateDetailedExplanation = useCallback((analysisResult: any, analysisType: string): string => {
    switch (analysisType) {
      case 'personality':
        return `
        성향 분석에서는 여러 측면을 종합적으로 고려했습니다. 
        의사소통 스타일, 감정 인식, 문제 해결 능력, 사회적 상호작용, 리더십, 창의성 등 6개 영역을 분석했습니다.
        
        특히 의사소통 스타일에서는 명확하고 논리적인 접근을 선호하는 경향이 ${analysisResult.personality?.[0]?.score * 100}%의 신뢰도로 확인되었습니다. 
        이는 복잡한 정보를 체계적으로 전달하는 능력이 뛰어나다는 것을 의미합니다.
        
        감정 인식 측면에서는 타인의 감정을 이해하고 공감하는 능력이 ${analysisResult.personality?.[1]?.score * 100}%로 나타났습니다. 
        이는 팀워크와 협업에서 중요한 자산이 될 수 있습니다.
        `;
      case 'construction_bias':
        return `
        시공사 성향 분석은 대화 내용에서 각 건설사에 대한 언급을 추출하고, 
        긍정적/부정적/중립적 성향을 수치화하여 분석했습니다.
        
        대우건설의 경우, ${analysisResult.constructionBias?.company_analysis?.대우건설?.positive_mentions}건의 긍정적 언급과 
        ${analysisResult.constructionBias?.company_analysis?.대우건설?.negative_mentions}건의 부정적 언급이 있었으며, 
        편향 점수는 ${analysisResult.constructionBias?.company_analysis?.대우건설?.bias_score.toFixed(2)}로 나타났습니다.
        `;
      case 'kakao_chat':
        return `
        카카오톡 대화 분석에서는 ${analysisResult.kakaoChat?.message_count}개의 메시지를 분석하여 
        참여자별 소통 패턴과 전체적인 분위기를 파악했습니다.
        
        참여자 ${analysisResult.kakaoChat?.participants?.length}명 중에서 
        ${analysisResult.kakaoChat?.participant_analysis ? Object.keys(analysisResult.kakaoChat.participant_analysis)[0] : '주요 참여자'}가 
        가장 활발하게 소통했으며, ${analysisResult.kakaoChat?.participant_analysis ? 
          analysisResult.kakaoChat.participant_analysis[Object.keys(analysisResult.kakaoChat.participant_analysis)[0]]?.message_count : 0}개의 메시지를 보냈습니다.
        `;
      case 'public_opinion':
        return `
        여론 분석에서는 다양한 의견을 수집하여 전체적인 여론 분포와 주요 관심사를 파악했습니다.
        
        감정 분포를 보면 긍정적 의견이 ${(analysisResult.publicOpinion?.sentiment_distribution?.positive * 100).toFixed(1)}%, 
        중립적 의견이 ${(analysisResult.publicOpinion?.sentiment_distribution?.neutral * 100).toFixed(1)}%, 
        부정적 의견이 ${(analysisResult.publicOpinion?.sentiment_distribution?.negative * 100).toFixed(1)}%로 나타났습니다.
        `;
      default:
        return '분석 결과에 대한 상세한 설명입니다.';
    }
  }, []);

  // 예시 생성
  const generateExamples = useCallback((analysisResult: any, analysisType: string): string[] => {
    switch (analysisType) {
      case 'personality':
        return [
          "의사소통 스타일: '이 프로젝트는 3단계로 나누어 진행하겠습니다. 각 단계별로 구체적인 목표와 일정을 설정했습니다.'",
          "감정 인식: '팀원이 어려움을 겪고 있는 것 같아 보입니다. 어떤 부분에서 도움이 필요하신지 말씀해 주세요.'",
          "문제 해결: '이 문제를 해결하기 위해 먼저 원인을 파악하고, 가능한 해결책들을 우선순위별로 정리해보겠습니다.'"
        ];
      case 'construction_bias':
        return [
          "긍정적 언급: '대우건설의 기술력과 안전 관리 시스템이 정말 뛰어나다고 생각합니다.'",
          "부정적 언급: '공사비가 예상보다 많이 들 것 같아서 걱정입니다.'",
          "중립적 언급: '여러 건설사들의 제안서를 비교해보고 결정하겠습니다.'"
        ];
      case 'kakao_chat':
        return [
          "리더십 스타일: '다음 주까지 각자 담당 부분을 정리해서 공유해주세요.'",
          "전문적 소통: '기술적 세부사항은 별도 문서로 정리해서 첨부하겠습니다.'",
          "팀워크: '모두 수고하셨습니다. 다음 회의에서 더 구체적으로 논의해보겠습니다.'"
        ];
      case 'public_opinion':
        return [
          "투명성 요구: '재개발 과정에서 모든 정보가 투명하게 공개되어야 합니다.'",
          "비용 효율성: '예산을 효율적으로 사용하면서도 품질을 유지할 수 있는 방안을 찾아야 합니다.'",
          "환경 영향: '환경에 미치는 영향을 최소화하는 방향으로 계획을 수립해야 합니다.'"
        ];
      default:
        return [];
    }
  }, []);

  // 신뢰도 계산
  const calculateConfidence = useCallback((analysisResult: any, analysisType: string): number => {
    let confidence = 0.8;
    
    switch (analysisType) {
      case 'personality':
        if (analysisResult.personality) {
          const avgConfidence = analysisResult.personality.reduce((sum: number, trait: any) => sum + trait.confidence, 0) / analysisResult.personality.length;
          confidence = avgConfidence;
        }
        break;
      case 'construction_bias':
        if (analysisResult.constructionBias) {
          const totalMentions = Object.values(analysisResult.constructionBias.company_analysis).reduce((sum: number, company: any) => 
            sum + company.positive_mentions + company.negative_mentions + company.neutral_mentions, 0);
          confidence = Math.min(0.95, 0.7 + (totalMentions / 100) * 0.25);
        }
        break;
      case 'kakao_chat':
        if (analysisResult.kakaoChat) {
          const messageCount = analysisResult.kakaoChat.message_count;
          confidence = Math.min(0.95, 0.6 + (messageCount / 200) * 0.35);
        }
        break;
      case 'public_opinion':
        if (analysisResult.publicOpinion) {
          const totalOpinions = (analysisResult.publicOpinion.sentiment_distribution.positive + 
                                analysisResult.publicOpinion.sentiment_distribution.neutral + 
                                analysisResult.publicOpinion.sentiment_distribution.negative) * 1000;
          confidence = Math.min(0.95, 0.7 + (totalOpinions / 10000) * 0.25);
        }
        break;
    }

    return confidence;
  }, []);

  // 대화형 응답 포맷팅
  const formatConversationalResponse = useCallback((detailedResponse: DetailedResponse): string => {
    let response = '';
    
    response += detailedResponse.mainResponse + '\n\n';
    response += `**📋 상세 설명**\n${detailedResponse.detailedExplanation}\n\n`;
    
    if (detailedResponse.examples.length > 0) {
      response += `**💡 구체적인 예시**\n`;
      detailedResponse.examples.forEach((example, index) => {
        response += `${index + 1}. ${example}\n`;
      });
      response += '\n';
    }
    
    response += `**📊 분석 신뢰도**: ${(detailedResponse.confidence * 100).toFixed(1)}%\n\n`;
    
    return response;
  }, []);

  return {
    generateDetailedResponse,
    formatConversationalResponse,
    isGenerating
  };
};

export default DetailedConversationalAI;
