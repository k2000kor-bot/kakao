import React, { useState, useEffect } from 'react';
import { promotionalContentAPI, PromotionalMaterialCreate, DeliveryPlanCreate, MarketingCampaignCreate, ContentTemplateCreate, PromotionalMaterial, DeliveryPlan, MarketingCampaign, ContentTemplate, DeliveryPerformance } from '../services/promotionalContentAPI';

interface PromotionalContentSystemProps {
  onMaterialCreated?: (material: any) => void;
  onDeliveryPlanCreated?: (plan: any) => void;
  onCampaignCreated?: (campaign: any) => void;
}

const PromotionalContentSystem: React.FC<PromotionalContentSystemProps> = ({
  onMaterialCreated,
  onDeliveryPlanCreated,
  onCampaignCreated
}) => {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [projects, setProjects] = useState<Array<{ id: string; name: string; description?: string; category?: string }>>([]);
  const [materials, setMaterials] = useState<PromotionalMaterial[]>([]);
  const [deliveryPlans, setDeliveryPlans] = useState<DeliveryPlan[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [serverStatus, setServerStatus] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'materials' | 'delivery' | 'campaigns' | 'templates' | 'performance'>('materials');
  
  // 폼 상태
  const [materialForm, setMaterialForm] = useState({
    title: '',
    content: '',
    material_type: '브로셔',
    target_audience: '',
    delivery_channels: [] as string[]
  });

  const [deliveryForm, setDeliveryForm] = useState({
    delivery_type: '이메일',
    target_audience: '',
    schedule_date: '',
    delivery_channels: [] as string[]
  });

  const [campaignForm, setCampaignForm] = useState({
    campaign_name: '',
    description: '',
    campaign_type: '브랜드 인지도',
    start_date: '',
    end_date: '',
    budget: 0
  });

  const [templateForm, setTemplateForm] = useState({
    template_name: '',
    template_type: '브로셔',
    content_structure: '',
    variables: [] as string[]
  });

  useEffect(() => {
    checkServerStatus();
    loadProjects();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadProjectData();
    }
  }, [selectedProject]);

  const checkServerStatus = async () => {
    try {
      const isHealthy = await promotionalContentAPI.checkStatus();
      setServerStatus(isHealthy);
    } catch (err) {
      setServerStatus(false);
    }
  };

  const loadProjects = async () => {
    // 시뮬레이션: 실제로는 API에서 프로젝트 목록을 가져옴
    const mockProjects = [
      { id: 'project_1', name: '건설 프로젝트 A', description: '주거 건설 프로젝트', category: '건설' },
      { id: 'project_2', name: '부동산 개발 B', description: '상업 시설 개발', category: '부동산' },
      { id: 'project_3', name: 'IT 시스템 구축', description: '기업 IT 인프라 구축', category: 'IT' }
    ];
    setProjects(mockProjects);
  };

  const loadProjectData = async () => {
    if (!selectedProject) return;

    try {
      setIsLoading(true);
      
      // 홍보물 목록 조회
      const projectMaterials = await promotionalContentAPI.getProjectMaterials(selectedProject);
      setMaterials(projectMaterials);
      
      // 마케팅 캠페인 조회
      const projectCampaigns = await promotionalContentAPI.getProjectCampaigns(selectedProject);
      setCampaigns(projectCampaigns);
      
    } catch (err) {
      setError('프로젝트 데이터 로드 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const contentTemplates = await promotionalContentAPI.getContentTemplates();
      setTemplates(contentTemplates);
    } catch (err) {
      console.error('템플릿 로드 실패:', err);
    }
  };

  const handleCreateMaterial = async () => {
    if (!selectedProject || !materialForm.title || !materialForm.content) {
      setError('필수 정보를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const materialData: PromotionalMaterialCreate = {
        project_id: selectedProject,
        title: materialForm.title,
        content: materialForm.content,
        material_type: materialForm.material_type,
        target_audience: materialForm.target_audience || undefined,
        delivery_channels: materialForm.delivery_channels.length > 0 ? materialForm.delivery_channels : undefined
      };

      const materialId = await promotionalContentAPI.createMaterial(materialData);
      
      // 폼 초기화
      setMaterialForm({
        title: '',
        content: '',
        material_type: '브로셔',
        target_audience: '',
        delivery_channels: []
      });

      // 프로젝트 데이터 새로고침
      await loadProjectData();
      
      onMaterialCreated?.({ id: materialId, ...materialData });
    } catch (err) {
      setError('홍보물 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDeliveryPlan = async (materialId: string) => {
    if (!deliveryForm.delivery_type) {
      setError('전달 타입을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const planData: DeliveryPlanCreate = {
        material_id: materialId,
        delivery_type: deliveryForm.delivery_type,
        target_audience: deliveryForm.target_audience || undefined,
        schedule_date: deliveryForm.schedule_date || undefined,
        delivery_channels: deliveryForm.delivery_channels.length > 0 ? deliveryForm.delivery_channels : undefined
      };

      const planId = await promotionalContentAPI.createDeliveryPlan(planData);
      
      // 폼 초기화
      setDeliveryForm({
        delivery_type: '이메일',
        target_audience: '',
        schedule_date: '',
        delivery_channels: []
      });

      onDeliveryPlanCreated?.({ id: planId, ...planData });
    } catch (err) {
      setError('전달 계획 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!selectedProject || !campaignForm.campaign_name) {
      setError('캠페인 이름을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const campaignData: MarketingCampaignCreate = {
        project_id: selectedProject,
        campaign_name: campaignForm.campaign_name,
        description: campaignForm.description || undefined,
        campaign_type: campaignForm.campaign_type || undefined,
        start_date: campaignForm.start_date || undefined,
        end_date: campaignForm.end_date || undefined,
        budget: campaignForm.budget || undefined
      };

      const campaignId = await promotionalContentAPI.createCampaign(campaignData);
      
      // 폼 초기화
      setCampaignForm({
        campaign_name: '',
        description: '',
        campaign_type: '브랜드 인지도',
        start_date: '',
        end_date: '',
        budget: 0
      });

      // 프로젝트 데이터 새로고침
      await loadProjectData();
      
      onCampaignCreated?.({ id: campaignId, ...campaignData });
    } catch (err) {
      setError('마케팅 캠페인 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.template_name || !templateForm.content_structure) {
      setError('템플릿 이름과 구조를 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const templateData: ContentTemplateCreate = {
        template_name: templateForm.template_name,
        template_type: templateForm.template_type,
        content_structure: templateForm.content_structure,
        variables: templateForm.variables.length > 0 ? templateForm.variables : undefined
      };

      const templateId = await promotionalContentAPI.createTemplate(templateData);
      
      // 폼 초기화
      setTemplateForm({
        template_name: '',
        template_type: '브로셔',
        content_structure: '',
        variables: []
      });

      // 템플릿 목록 새로고침
      await loadTemplates();
    } catch (err) {
      setError('콘텐츠 템플릿 생성 실패');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateContent = async (templateType: string, variables: Record<string, string>) => {
    try {
      const content = await promotionalContentAPI.generateContent(templateType, variables);
      return content;
    } catch (err) {
      setError('콘텐츠 생성 실패');
      return null;
    }
  };

  const materialTypes = [
    "브로셔", "팜플렛", "포스터", "뉴스레터", "소셜미디어", 
    "이메일", "웹사이트", "광고", "프레스릴리즈", "비디오"
  ];

  const deliveryChannels = [
    "이메일", "소셜미디어", "웹사이트", "인쇄물", "SMS",
    "전화", "대면", "온라인광고", "오프라인광고", "인플루언서"
  ];

  const campaignTypes = [
    "브랜드 인지도", "제품 런칭", "판매 촉진", "고객 유지",
    "이벤트 홍보", "사회적 책임", "교육", "기업 홍보"
  ];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📢 홍보물 및 전달 시스템</h1>
        <p className="text-gray-600">홍보물 생성, 전달 관리, 마케팅 캠페인, 콘텐츠 템플릿 기능입니다.</p>

        {/* 서버 상태 표시 */}
        <div className="mt-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${serverStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className={`text-sm ${serverStatus ? 'text-green-600' : 'text-red-600'}`}>
            {serverStatus ? '홍보물 서버 연결됨' : '홍보물 서버 연결 안됨'}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 프로젝트 선택 */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">프로젝트 관리</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="project-select" className="block text-sm font-medium text-gray-700 mb-2">
                  프로젝트 선택
                </label>
                <select
                  id="project-select"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">프로젝트를 선택하세요</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} ({project.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {/* 탭 네비게이션 */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'materials' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📄 홍보물
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'delivery' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📤 전달 계획
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'campaigns' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎯 마케팅 캠페인
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'templates' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📋 콘텐츠 템플릿
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'performance' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 성과 분석
              </button>
            </div>

            {/* 홍보물 탭 */}
            {activeTab === 'materials' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">홍보물 관리</h3>
                  <button
                    onClick={handleCreateMaterial}
                    disabled={isLoading || !selectedProject}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? '생성 중...' : '새 홍보물 생성'}
                  </button>
                </div>

                {!selectedProject ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">먼저 프로젝트를 선택해주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 홍보물 생성 폼 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-4">새 홍보물 생성</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            제목
                          </label>
                          <input
                            type="text"
                            value={materialForm.title}
                            onChange={(e) => setMaterialForm({...materialForm, title: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="홍보물 제목"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            홍보물 타입
                          </label>
                          <select
                            value={materialForm.material_type}
                            onChange={(e) => setMaterialForm({...materialForm, material_type: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {materialTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            타겟 오디언스
                          </label>
                          <input
                            type="text"
                            value={materialForm.target_audience}
                            onChange={(e) => setMaterialForm({...materialForm, target_audience: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="타겟 오디언스"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            전달 채널
                          </label>
                          <select
                            multiple
                            value={materialForm.delivery_channels}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value);
                              setMaterialForm({...materialForm, delivery_channels: selected});
                            }}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            {deliveryChannels.map((channel) => (
                              <option key={channel} value={channel}>{channel}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          내용
                        </label>
                        <textarea
                          value={materialForm.content}
                          onChange={(e) => setMaterialForm({...materialForm, content: e.target.value})}
                          rows={4}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          placeholder="홍보물 내용을 입력하세요"
                        />
                      </div>
                    </div>

                    {/* 홍보물 목록 */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">생성된 홍보물</h4>
                      {materials.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">생성된 홍보물이 없습니다.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {materials.map((material) => (
                            <div key={material.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-2">{material.title}</h5>
                                  <p className="text-sm text-gray-600 mb-2">{material.content}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>타입: {material.material_type}</span>
                                    <span>상태: {material.status}</span>
                                    <span>생성: {new Date(material.created_at).toLocaleDateString()}</span>
                                  </div>
                                  {material.delivery_channels.length > 0 && (
                                    <div className="mt-2">
                                      <span className="text-xs text-gray-500">전달 채널: </span>
                                      {material.delivery_channels.map((channel, index) => (
                                        <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                                          {channel}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <button
                                    onClick={() => handleCreateDeliveryPlan(material.id)}
                                    className="text-blue-600 hover:text-blue-800 text-sm"
                                  >
                                    전달 계획 생성
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 전달 계획 탭 */}
            {activeTab === 'delivery' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">전달 계획 관리</h3>
                
                {deliveryPlans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">생성된 전달 계획이 없습니다.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {deliveryPlans.map((plan) => (
                      <div key={plan.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 mb-2">전달 계획 #{plan.id.slice(0, 8)}</h5>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>타입: {plan.delivery_type}</span>
                              <span>상태: {plan.status}</span>
                              <span>생성: {new Date(plan.created_at).toLocaleDateString()}</span>
                            </div>
                            {plan.schedule_date && (
                              <div className="mt-2 text-xs text-gray-500">
                                예정일: {new Date(plan.schedule_date).toLocaleDateString()}
                              </div>
                            )}
                            {plan.delivery_channels.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs text-gray-500">전달 채널: </span>
                                {plan.delivery_channels.map((channel, index) => (
                                  <span key={index} className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1">
                                    {channel}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 마케팅 캠페인 탭 */}
            {activeTab === 'campaigns' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">마케팅 캠페인</h3>
                  <button
                    onClick={handleCreateCampaign}
                    disabled={isLoading || !selectedProject}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? '생성 중...' : '새 캠페인 생성'}
                  </button>
                </div>

                {!selectedProject ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">먼저 프로젝트를 선택해주세요.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* 캠페인 생성 폼 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-4">새 마케팅 캠페인 생성</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            캠페인 이름
                          </label>
                          <input
                            type="text"
                            value={campaignForm.campaign_name}
                            onChange={(e) => setCampaignForm({...campaignForm, campaign_name: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="캠페인 이름"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            캠페인 타입
                          </label>
                          <select
                            value={campaignForm.campaign_type}
                            onChange={(e) => setCampaignForm({...campaignForm, campaign_type: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            {campaignTypes.map((type) => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            시작일
                          </label>
                          <input
                            type="date"
                            value={campaignForm.start_date}
                            onChange={(e) => setCampaignForm({...campaignForm, start_date: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            종료일
                          </label>
                          <input
                            type="date"
                            value={campaignForm.end_date}
                            onChange={(e) => setCampaignForm({...campaignForm, end_date: e.target.value})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            예산
                          </label>
                          <input
                            type="number"
                            value={campaignForm.budget}
                            onChange={(e) => setCampaignForm({...campaignForm, budget: parseFloat(e.target.value) || 0})}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="예산 (원)"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          설명
                        </label>
                        <textarea
                          value={campaignForm.description}
                          onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                          rows={3}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          placeholder="캠페인 설명"
                        />
                      </div>
                    </div>

                    {/* 캠페인 목록 */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">생성된 캠페인</h4>
                      {campaigns.length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-gray-500">생성된 캠페인이 없습니다.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {campaigns.map((campaign) => (
                            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900 mb-2">{campaign.campaign_name}</h5>
                                  <p className="text-sm text-gray-600 mb-2">{campaign.description}</p>
                                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <span>타입: {campaign.campaign_type}</span>
                                    <span>상태: {campaign.status}</span>
                                    <span>예산: {campaign.budget?.toLocaleString()}원</span>
                                    <span>생성: {new Date(campaign.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 콘텐츠 템플릿 탭 */}
            {activeTab === 'templates' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">콘텐츠 템플릿</h3>
                  <button
                    onClick={handleCreateTemplate}
                    disabled={isLoading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? '생성 중...' : '새 템플릿 생성'}
                  </button>
                </div>

                <div className="space-y-6">
                  {/* 템플릿 생성 폼 */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-4">새 콘텐츠 템플릿 생성</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          템플릿 이름
                        </label>
                        <input
                          type="text"
                          value={templateForm.template_name}
                          onChange={(e) => setTemplateForm({...templateForm, template_name: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="템플릿 이름"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          템플릿 타입
                        </label>
                        <select
                          value={templateForm.template_type}
                          onChange={(e) => setTemplateForm({...templateForm, template_type: e.target.value})}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {materialTypes.map((type) => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        콘텐츠 구조
                      </label>
                      <textarea
                        value={templateForm.content_structure}
                        onChange={(e) => setTemplateForm({...templateForm, content_structure: e.target.value})}
                        rows={6}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                        placeholder="템플릿 구조를 입력하세요. 변수는 {변수명} 형태로 사용하세요."
                      />
                    </div>
                  </div>

                  {/* 템플릿 목록 */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">사용 가능한 템플릿</h4>
                    {templates.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">생성된 템플릿이 없습니다.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {templates.map((template) => (
                          <div key={template.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900 mb-2">{template.template_name}</h5>
                                <p className="text-sm text-gray-600 mb-2">{template.content_structure}</p>
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                  <span>타입: {template.template_type}</span>
                                  <span>생성: {new Date(template.created_at).toLocaleDateString()}</span>
                                </div>
                                {template.variables.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-xs text-gray-500">변수: </span>
                                    {template.variables.map((variable, index) => (
                                      <span key={index} className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mr-1">
                                        {variable}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 성과 분석 탭 */}
            {activeTab === 'performance' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">성과 분석</h3>
                
                <div className="text-center py-8">
                  <p className="text-gray-500">성과 분석 기능은 전달 계획이 실행된 후에 사용할 수 있습니다.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalContentSystem; 