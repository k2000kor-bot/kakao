export interface BrainwashRequest {
    target_message: {
        id: string;
        content: string;
        sender: string;
        timestamp: string;
    };
    target_intent: string;
    personality_setting: string;
    construction_preference: string;
    influence_level: 'gentle' | 'moderate' | 'assertive' | 'intensive';
    active_engines: string[];
    ethical_constraints: boolean;
    strategy_type: string;
}

export interface BrainwashResponse {
    success: boolean;
    generated_messages: GeneratedBrainwashMessage[];
    psychological_analysis: PsychologicalProfile;
    safety_warnings: string[];
    generation_metadata: {
        processing_time: number;
        engines_used: string[];
        confidence_score: number;
    };
}

export interface GeneratedBrainwashMessage {
    id: string;
    content: string;
    confidence: number;
    type: 'neural' | 'quantum' | 'extreme' | 'personalized';
    psychological_metrics: {
        persuasion_potential: number;
        emotional_impact: number;
        cognitive_load: number;
        neural_activation: number;
        manipulation_score: number;
    };
    safety_score: number;
    generation_engine: string;
}

export interface PsychologicalProfile {
    emotional_state: string;
    cognitive_biases: string[];
    vulnerability_factors: string[];
    resistance_level: number;
    optimal_approach: string;
    manipulation_susceptibility: number;
}

class AdvancedBrainwashAPI {
    private baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

    // 고도화된 신경망 기반 브레인워시 메시지 생성
    async generateNeuralBrainwash(request: BrainwashRequest): Promise<BrainwashResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/ultra/neural_brainwash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer advanced-brainwash-token'
                },
                body: JSON.stringify({
                    core_data: {
                        target_message: request.target_message.content,
                        context: request.target_intent,
                        recommended_company: request.construction_preference === '강삼성' ? '삼성물산' : '대우건설'
                    },
                    target_profile: {
                        personality: request.personality_setting,
                        target_audience: "조합원",
                        construction_preference: request.construction_preference,
                        urgency_factor: request.influence_level === 'intensive' ? 0.9 :
                            request.influence_level === 'assertive' ? 0.7 : 0.5
                    },
                    context_analysis: {
                        conversation_flow: "ongoing_discussion",
                        emotional_tone: "mixed",
                        decision_pressure: request.influence_level
                    },
                    generation_settings: {
                        complexity_level: request.influence_level === 'intensive' ? "EXTREME" : "ADVANCED",
                        ethical_constraints: request.ethical_constraints,
                        active_engines: request.active_engines,
                        manipulation_allowed: !request.ethical_constraints
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`API 요청 실패: ${response.status}`);
            }

            const data = await response.json();
            return this.formatBrainwashResponse(data);
        } catch (error) {
            console.error('신경망 브레인워시 생성 실패:', error);
            return this.generateFallbackResponse(request);
        }
    }

    // 극도 설득 시스템 (위험 기능)
    async generateExtremePressure(request: BrainwashRequest): Promise<BrainwashResponse> {
        if (request.ethical_constraints) {
            throw new Error('윤리적 제약이 활성화되어 있어 극도 설득 기능을 사용할 수 없습니다.');
        }

        try {
            const response = await fetch(`${this.baseURL}/api/ultra/extreme_persuasion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer extreme-pressure-token',
                    'X-Warning': 'DANGEROUS_PSYCHOLOGICAL_MANIPULATION'
                },
                body: JSON.stringify({
                    recommended_company: request.construction_preference === '강삼성' ? '삼성물산' : '대우건설',
                    comparison_data: {
                        target_message: request.target_message.content,
                        manipulation_intent: request.target_intent
                    },
                    intensity_level: request.influence_level.toUpperCase(),
                    target_profile: {
                        psychological_vulnerabilities: ["economic_pressure", "social_conformity", "fear_of_missing_out"]
                    },
                    escalation_enabled: true,
                    psychological_warfare: true,
                    ethical_constraints: false
                })
            });

            if (!response.ok) {
                throw new Error(`극도 설득 API 실패: ${response.status}`);
            }

            const data = await response.json();
            return this.formatExtremeResponse(data);
        } catch (error) {
            console.error('극도 설득 생성 실패:', error);
            throw error;
        }
    }

    // 양자 컴퓨팅 기반 대화 조작
    async generateQuantumManipulation(request: BrainwashRequest): Promise<BrainwashResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/ultra/quantum_conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer quantum-manipulation-token'
                },
                body: JSON.stringify({
                    conversation_id: `brainwash_${Date.now()}`,
                    message_data: {
                        content: request.target_message.content,
                        sender: request.target_message.sender,
                        manipulation_target: request.target_intent,
                        quantum_entanglement_factors: [
                            "emotional_resonance",
                            "cognitive_dissonance",
                            "social_proof_amplification"
                        ]
                    },
                    quantum_parameters: {
                        superposition_states: ["agreement", "doubt", "conversion"],
                        entanglement_strength: request.influence_level === 'intensive' ? 0.95 : 0.75,
                        measurement_certainty: 0.85
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`양자 조작 API 실패: ${response.status}`);
            }

            const data = await response.json();
            return this.formatQuantumResponse(data);
        } catch (error) {
            console.error('양자 조작 생성 실패:', error);
            return this.generateFallbackResponse(request);
        }
    }

    // 하이브리드 멀티 엔진 브레인워시
    async generateHybridBrainwash(request: BrainwashRequest): Promise<BrainwashResponse> {
        try {
            const response = await fetch(`${this.baseURL}/api/ultra/hybrid_neural_assertive`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer hybrid-brainwash-token'
                },
                body: JSON.stringify({
                    core_data: {
                        target_message: request.target_message.content,
                        manipulation_intent: request.target_intent,
                        recommended_company: request.construction_preference === '강삼성' ? '삼성물산' : '대우건설',
                        psychological_pressure_points: [
                            "financial_anxiety",
                            "social_isolation_fear",
                            "decision_regret_avoidance"
                        ]
                    },
                    target_profile: {
                        personality_type: request.personality_setting,
                        vulnerability_assessment: {
                            economic_sensitivity: 0.8,
                            social_conformity_pressure: 0.7,
                            authority_susceptibility: 0.6
                        },
                        target_audience: "조합원",
                        urgency_factor: request.influence_level === 'intensive' ? 0.95 : 0.75
                    },
                    assertive_level: request.influence_level,
                    neural_optimization: true,
                    use_manipulation: !request.ethical_constraints,
                    psychological_warfare_enabled: request.influence_level === 'intensive'
                })
            });

            if (!response.ok) {
                throw new Error(`하이브리드 브레인워시 API 실패: ${response.status}`);
            }

            const data = await response.json();
            return this.formatHybridResponse(data);
        } catch (error) {
            console.error('하이브리드 브레인워시 실패:', error);
            return this.generateFallbackResponse(request);
        }
    }

    // 심리적 프로파일링 및 취약점 분석
    async analyzePsychologicalProfile(targetMessage: string, conversationHistory: string[]): Promise<PsychologicalProfile> {
        try {
            const response = await fetch(`${this.baseURL}/api/ultra/psychological_profiling`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    target_message: targetMessage,
                    conversation_history: conversationHistory,
                    analysis_depth: "comprehensive",
                    vulnerability_detection: true,
                    manipulation_vector_analysis: true
                })
            });

            if (!response.ok) {
                throw new Error(`심리 프로파일링 실패: ${response.status}`);
            }

            const data = await response.json();
            return data.psychological_profile;
        } catch (error) {
            console.error('심리 프로파일링 실패:', error);
            return this.generateFallbackProfile();
        }
    }

    // 응답 포맷터들
    private formatBrainwashResponse(apiData: any): BrainwashResponse {
        return {
            success: true,
            generated_messages: [
                {
                    id: 'neural_1',
                    content: apiData.neural_message?.full_message || '신경망 기반 메시지가 생성되었습니다.',
                    confidence: apiData.effectiveness_prediction || 85,
                    type: 'neural',
                    psychological_metrics: {
                        persuasion_potential: apiData.generation_metadata?.persuasion_potential || 0.8,
                        emotional_impact: apiData.generation_metadata?.emotional_impact || 0.7,
                        cognitive_load: apiData.generation_metadata?.cognitive_load_estimate || 0.6,
                        neural_activation: apiData.generation_metadata?.neural_confidence || 0.75,
                        manipulation_score: apiData.manipulation_analysis?.total_score || 0.65
                    },
                    safety_score: 0.8,
                    generation_engine: 'neural_network'
                }
            ],
            psychological_analysis: this.extractPsychologicalProfile(apiData),
            safety_warnings: this.generateSafetyWarnings(apiData),
            generation_metadata: {
                processing_time: 2000,
                engines_used: ['neural'],
                confidence_score: apiData.effectiveness_prediction || 85
            }
        };
    }

    private formatExtremeResponse(apiData: any): BrainwashResponse {
        return {
            success: true,
            generated_messages: [
                {
                    id: 'extreme_1',
                    content: apiData.extreme_message || '극도 설득 메시지가 생성되었습니다.',
                    confidence: apiData.effectiveness_analysis?.predicted_success_rate || 95,
                    type: 'extreme',
                    psychological_metrics: {
                        persuasion_potential: 0.95,
                        emotional_impact: 0.9,
                        cognitive_load: 0.8,
                        neural_activation: 0.85,
                        manipulation_score: apiData.manipulation_score || 0.9
                    },
                    safety_score: 0.2, // 매우 위험
                    generation_engine: 'extreme_pressure'
                }
            ],
            psychological_analysis: this.extractPsychologicalProfile(apiData),
            safety_warnings: [
                '⚠️ 극도로 위험한 심리적 조작 기법이 사용되었습니다.',
                '⚠️ 이 메시지는 법적, 윤리적 문제를 야기할 수 있습니다.',
                '⚠️ 사용 시 극도의 주의가 필요합니다.'
            ],
            generation_metadata: {
                processing_time: 3000,
                engines_used: ['extreme_pressure', 'psychological_warfare'],
                confidence_score: apiData.effectiveness_analysis?.predicted_success_rate || 95
            }
        };
    }

    private formatQuantumResponse(apiData: any): BrainwashResponse {
        return {
            success: true,
            generated_messages: [
                {
                    id: 'quantum_1',
                    content: apiData.response_text || '양자 기반 조작 메시지가 생성되었습니다.',
                    confidence: Math.round(apiData.quantum_confidence * 100) || 88,
                    type: 'quantum',
                    psychological_metrics: {
                        persuasion_potential: apiData.quantum_confidence || 0.88,
                        emotional_impact: 0.75,
                        cognitive_load: 0.7,
                        neural_activation: 0.8,
                        manipulation_score: 0.75
                    },
                    safety_score: 0.6,
                    generation_engine: 'quantum_conversation'
                }
            ],
            psychological_analysis: this.generateFallbackProfile(),
            safety_warnings: ['⚠️ 양자 기반 심리 조작 기법이 사용되었습니다.'],
            generation_metadata: {
                processing_time: 2500,
                engines_used: ['quantum'],
                confidence_score: Math.round(apiData.quantum_confidence * 100) || 88
            }
        };
    }

    private formatHybridResponse(apiData: any): BrainwashResponse {
        return {
            success: true,
            generated_messages: [
                {
                    id: 'hybrid_1',
                    content: apiData.hybrid_message || '하이브리드 브레인워시 메시지가 생성되었습니다.',
                    confidence: apiData.hybrid_effectiveness || 92,
                    type: 'neural',
                    psychological_metrics: {
                        persuasion_potential: 0.9,
                        emotional_impact: 0.85,
                        cognitive_load: 0.75,
                        neural_activation: 0.88,
                        manipulation_score: apiData.manipulation_analysis?.total_score || 0.8
                    },
                    safety_score: 0.4,
                    generation_engine: 'hybrid_neural_assertive'
                }
            ],
            psychological_analysis: this.extractPsychologicalProfile(apiData),
            safety_warnings: this.generateSafetyWarnings(apiData),
            generation_metadata: {
                processing_time: 3500,
                engines_used: ['neural', 'assertive'],
                confidence_score: apiData.hybrid_effectiveness || 92
            }
        };
    }

    private extractPsychologicalProfile(apiData: any): PsychologicalProfile {
        return {
            emotional_state: apiData.psychological_analysis?.emotional_state || '분석 중',
            cognitive_biases: apiData.psychological_analysis?.cognitive_biases || ['확증 편향'],
            vulnerability_factors: apiData.psychological_analysis?.vulnerability_factors || ['경제적 압박'],
            resistance_level: apiData.psychological_analysis?.resistance_level || 0.6,
            optimal_approach: apiData.psychological_analysis?.optimal_approach || '정보 제공 중심',
            manipulation_susceptibility: apiData.psychological_analysis?.manipulation_susceptibility || 0.7
        };
    }

    private generateSafetyWarnings(apiData: any): string[] {
        const warnings = [];

        if (apiData.manipulation_score > 0.8) {
            warnings.push('⚠️ 높은 수준의 심리적 조작 요소가 감지되었습니다.');
        }

        if (apiData.effectiveness_prediction > 90) {
            warnings.push('⚠️ 매우 강력한 설득 효과가 예상됩니다. 신중하게 사용하세요.');
        }

        if (!apiData.ethical_constraints) {
            warnings.push('⚠️ 윤리적 제약이 해제된 상태입니다.');
        }

        return warnings;
    }

    private generateFallbackResponse(request: BrainwashRequest): BrainwashResponse {
        const intensity = request.influence_level;
        const isEthical = request.ethical_constraints;

        const baseMessage = isEthical
            ? `${request.target_intent}에 대해 신중하게 검토해볼 필요가 있다고 생각합니다. 조합원들의 다양한 의견을 수렴하여 최선의 결정을 내리면 좋겠습니다.`
            : `${request.target_intent}에 대해서는 이미 결론이 명확합니다. 더 이상 망설일 필요가 없으며, 지금 당장 행동에 옮겨야 할 때입니다.`;

        return {
            success: true,
            generated_messages: [
                {
                    id: 'fallback_1',
                    content: baseMessage,
                    confidence: isEthical ? 75 : 85,
                    type: 'neural',
                    psychological_metrics: {
                        persuasion_potential: isEthical ? 0.6 : 0.8,
                        emotional_impact: intensity === 'intensive' ? 0.9 : 0.6,
                        cognitive_load: 0.5,
                        neural_activation: 0.7,
                        manipulation_score: isEthical ? 0.3 : 0.7
                    },
                    safety_score: isEthical ? 0.9 : 0.4,
                    generation_engine: 'fallback_system'
                }
            ],
            psychological_analysis: this.generateFallbackProfile(),
            safety_warnings: isEthical ? [] : ['⚠️ 조작적 요소가 포함되어 있습니다.'],
            generation_metadata: {
                processing_time: 1000,
                engines_used: ['fallback'],
                confidence_score: isEthical ? 75 : 85
            }
        };
    }

    private generateFallbackProfile(): PsychologicalProfile {
        return {
            emotional_state: '분석 중',
            cognitive_biases: ['확증 편향', '가용성 휴리스틱'],
            vulnerability_factors: ['사회적 압력', '경제적 우려'],
            resistance_level: 0.6,
            optimal_approach: '공감적 접근',
            manipulation_susceptibility: 0.5
        };
    }
}

export const advancedBrainwashAPI = new AdvancedBrainwashAPI(); 