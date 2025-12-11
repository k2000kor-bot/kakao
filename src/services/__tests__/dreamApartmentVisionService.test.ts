/**
 * DreamApartmentVisionService 테스트
 */

import {
  DreamApartmentVisionService,
  dreamApartmentVisionService,
  DreamApartment,
  VisionBoard,
  Roadmap,
  FutureApartmentDesign,
} from '../dreamApartmentVisionService';

describe('DreamApartmentVisionService', () => {
  let service: DreamApartmentVisionService;

  beforeEach(() => {
    service = new DreamApartmentVisionService();
  });

  describe('초기화', () => {
    it('서비스 인스턴스 생성', () => {
      expect(service).toBeInstanceOf(DreamApartmentVisionService);
    });

    it('싱글톤 인스턴스 확인', () => {
      expect(dreamApartmentVisionService).toBeDefined();
    });

    it('초기 데이터 로드 확인', () => {
      const apartments = service.getDreamApartments();
      expect(Array.isArray(apartments)).toBe(true);
    });
  });

  describe('꿈의 아파트 생성', () => {
    it('기본 꿈의 아파트 생성', () => {
      const dreamData = {
        userId: 'user_test',
        name: '테스트 아파트',
        description: '테스트 설명',
        location: {
          region: '강남구',
          district: '역삼동',
          address: '서울시 강남구 역삼로',
        },
        specifications: {
          size: 85,
          rooms: 2,
          bathrooms: 1,
          parkingSpaces: 1,
          floor: 10,
          totalFloors: 20,
          direction: '남향',
          view: '도시뷰',
        },
        amenities: {
          interior: ['에어컨'],
          exterior: ['발코니'],
          community: ['헬스장'],
          smart: ['스마트 도어락'],
          eco: ['LED 조명'],
        },
        design: {
          style: 'modern' as const,
          colorScheme: '화이트',
          materials: ['대리석'],
          lighting: 'LED',
          furniture: ['소파'],
        },
        lifestyle: {
          familySize: 2,
          children: 0,
          pets: false,
          hobbies: ['독서'],
          workStyle: 'remote' as const,
          socialPreferences: ['조용함'],
        },
        budget: {
          targetPrice: 1000000000,
          currentSavings: 200000000,
          monthlyIncome: 5000000,
          loanAmount: 800000000,
          downPayment: 200000000,
        },
        timeline: {
          targetYear: 2025,
          currentProgress: 0,
          milestones: [],
        },
        investment: {
          currentValue: 1000000000,
          projectedValue: 1200000000,
          appreciationRate: 3.5,
          rentalPotential: 5000000,
          roi: 10.0,
        },
      };

      const result = service.createDreamApartment(dreamData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBe('테스트 아파트');
      expect(result.userId).toBe('user_test');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('생성된 아파트 목록에 포함 확인', () => {
      const dreamData = {
        userId: 'user_test2',
        name: '테스트 아파트 2',
        description: '테스트 설명 2',
        location: {
          region: '서초구',
          district: '반포동',
          address: '서울시 서초구 반포대로',
        },
        specifications: {
          size: 100,
          rooms: 3,
          bathrooms: 2,
          parkingSpaces: 2,
          floor: 15,
          totalFloors: 30,
          direction: '남동향',
          view: '한강뷰',
        },
        amenities: {
          interior: ['에어컨', '정수기'],
          exterior: ['발코니', '테라스'],
          community: ['헬스장', '수영장'],
          smart: ['스마트 도어락', '스마트 조명'],
          eco: ['LED 조명', '태양광'],
        },
        design: {
          style: 'luxury' as const,
          colorScheme: '골드 & 화이트',
          materials: ['대리석', '원목'],
          lighting: '스마트 LED',
          furniture: ['럭셔리 소파', '미니멀 테이블'],
        },
        lifestyle: {
          familySize: 4,
          children: 2,
          pets: true,
          hobbies: ['독서', '요리'],
          workStyle: 'hybrid' as const,
          socialPreferences: ['커뮤니티 활동'],
        },
        budget: {
          targetPrice: 2000000000,
          currentSavings: 500000000,
          monthlyIncome: 8000000,
          loanAmount: 1500000000,
          downPayment: 500000000,
        },
        timeline: {
          targetYear: 2026,
          currentProgress: 20,
          milestones: [],
        },
        investment: {
          currentValue: 2000000000,
          projectedValue: 2500000000,
          appreciationRate: 5.0,
          rentalPotential: 8000000,
          roi: 12.5,
        },
      };

      service.createDreamApartment(dreamData);
      const apartments = service.getDreamApartments('user_test2');

      expect(apartments.length).toBeGreaterThan(0);
      expect(apartments.some((a) => a.name === '테스트 아파트 2')).toBe(true);
    });
  });

  describe('비전 보드 생성', () => {
    it('기본 비전 보드 생성', () => {
      const visionData = {
        dreamApartmentId: '1',
        title: '테스트 비전 보드',
        description: '테스트 비전 보드 설명',
        images: [
          {
            id: 'img1',
            url: '/test/image1.jpg',
            category: 'exterior' as const,
            description: '외관 이미지',
            source: 'Test',
          },
        ],
        moodBoard: {
          colors: ['#FFFFFF', '#000000'],
          textures: ['대리석'],
          styles: ['모던'],
          keywords: ['스마트', '편리'],
        },
        inspiration: {
          sources: ['Pinterest'],
          quotes: ['테스트 명언'],
          goals: ['테스트 목표'],
        },
      };

      const result = service.createVisionBoard(visionData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('테스트 비전 보드');
      expect(result.dreamApartmentId).toBe('1');
      expect(result.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('로드맵 생성', () => {
    it('기본 로드맵 생성', () => {
      const roadmapData = {
        dreamApartmentId: '1',
        title: '테스트 로드맵',
        phases: [
          {
            id: 'phase1',
            name: '1단계',
            description: '1단계 설명',
            duration: 3,
            budget: 100000000,
            tasks: [],
            milestones: [],
          },
        ],
        totalDuration: 12,
        totalBudget: 1000000000,
        currentPhase: 1,
        progress: 0,
      };

      const result = service.createRoadmap(roadmapData);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.title).toBe('테스트 로드맵');
      expect(result.dreamApartmentId).toBe('1');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('꿈 실현 가능성 분석', () => {
    it('기본 실현 가능성 분석', () => {
      const dreamData = {
        userId: 'user_analysis',
        name: '분석 테스트 아파트',
        description: '분석 테스트',
        location: {
          region: '강남구',
          district: '역삼동',
          address: '서울시 강남구 역삼로',
        },
        specifications: {
          size: 85,
          rooms: 2,
          bathrooms: 1,
          parkingSpaces: 1,
          floor: 10,
          totalFloors: 20,
          direction: '남향',
          view: '도시뷰',
        },
        amenities: {
          interior: ['에어컨'],
          exterior: ['발코니'],
          community: ['헬스장'],
          smart: ['스마트 도어락'],
          eco: ['LED 조명'],
        },
        design: {
          style: 'modern' as const,
          colorScheme: '화이트',
          materials: ['대리석'],
          lighting: 'LED',
          furniture: ['소파'],
        },
        lifestyle: {
          familySize: 2,
          children: 0,
          pets: false,
          hobbies: ['독서'],
          workStyle: 'remote' as const,
          socialPreferences: ['조용함'],
        },
        budget: {
          targetPrice: 1000000000,
          currentSavings: 300000000,
          monthlyIncome: 6000000,
          loanAmount: 700000000,
          downPayment: 300000000,
        },
        timeline: {
          targetYear: 2025,
          currentProgress: 0,
          milestones: [],
        },
        investment: {
          currentValue: 1000000000,
          projectedValue: 1200000000,
          appreciationRate: 3.5,
          rentalPotential: 5000000,
          roi: 10.0,
        },
      };

      const apartment = service.createDreamApartment(dreamData);
      const analysis = service.analyzeDreamFeasibility(apartment.id);

      expect(analysis).toBeDefined();
      expect(analysis.dreamApartmentId).toBe(apartment.id);
      expect(analysis.feasibility).toBeDefined();
      expect(typeof analysis.feasibility.score).toBe('number');
      expect(analysis.feasibility.score).toBeGreaterThanOrEqual(0);
      expect(analysis.feasibility.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(analysis.feasibility.factors)).toBe(true);
      expect(analysis.marketAnalysis).toBeDefined();
      expect(analysis.financialAnalysis).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
    });

    it('존재하지 않는 아파트 분석 시 에러', () => {
      expect(() => {
        service.analyzeDreamFeasibility('nonexistent');
      }).toThrow('Dream apartment not found');
    });
  });

  describe('미래 아파트 설계 생성', () => {
    it('기본 미래 설계 생성', () => {
      const preferences = {
        style: 'modern',
        size: 100,
        budget: 2000000000,
        lifestyle: ['스마트 홈', '친환경'],
        priorities: ['기술', '지속가능성'],
      };

      const result = service.generateFutureDesign(preferences);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.name).toBeDefined();
      expect(result.concept).toBeDefined();
      expect(result.features).toBeDefined();
      expect(result.specifications).toBeDefined();
      expect(result.specifications.size).toBe(100);
      expect(result.cost).toBeDefined();
      expect(result.cost.totalCost).toBe(2000000000);
    });
  });

  describe('진행률 업데이트', () => {
    it('진행률 업데이트', () => {
      const dreamData = {
        userId: 'user_progress',
        name: '진행률 테스트 아파트',
        description: '진행률 테스트',
        location: {
          region: '강남구',
          district: '역삼동',
          address: '서울시 강남구 역삼로',
        },
        specifications: {
          size: 85,
          rooms: 2,
          bathrooms: 1,
          parkingSpaces: 1,
          floor: 10,
          totalFloors: 20,
          direction: '남향',
          view: '도시뷰',
        },
        amenities: {
          interior: ['에어컨'],
          exterior: ['발코니'],
          community: ['헬스장'],
          smart: ['스마트 도어락'],
          eco: ['LED 조명'],
        },
        design: {
          style: 'modern' as const,
          colorScheme: '화이트',
          materials: ['대리석'],
          lighting: 'LED',
          furniture: ['소파'],
        },
        lifestyle: {
          familySize: 2,
          children: 0,
          pets: false,
          hobbies: ['독서'],
          workStyle: 'remote' as const,
          socialPreferences: ['조용함'],
        },
        budget: {
          targetPrice: 1000000000,
          currentSavings: 200000000,
          monthlyIncome: 5000000,
          loanAmount: 800000000,
          downPayment: 200000000,
        },
        timeline: {
          targetYear: 2025,
          currentProgress: 0,
          milestones: [],
        },
        investment: {
          currentValue: 1000000000,
          projectedValue: 1200000000,
          appreciationRate: 3.5,
          rentalPotential: 5000000,
          roi: 10.0,
        },
      };

      const apartment = service.createDreamApartment(dreamData);
      const updated = service.updateProgress(apartment.id, 50);

      expect(updated.timeline.currentProgress).toBe(50);
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('진행률 범위 제한 (0-100)', () => {
      const dreamData = {
        userId: 'user_progress2',
        name: '진행률 테스트 아파트 2',
        description: '진행률 테스트 2',
        location: {
          region: '강남구',
          district: '역삼동',
          address: '서울시 강남구 역삼로',
        },
        specifications: {
          size: 85,
          rooms: 2,
          bathrooms: 1,
          parkingSpaces: 1,
          floor: 10,
          totalFloors: 20,
          direction: '남향',
          view: '도시뷰',
        },
        amenities: {
          interior: ['에어컨'],
          exterior: ['발코니'],
          community: ['헬스장'],
          smart: ['스마트 도어락'],
          eco: ['LED 조명'],
        },
        design: {
          style: 'modern' as const,
          colorScheme: '화이트',
          materials: ['대리석'],
          lighting: 'LED',
          furniture: ['소파'],
        },
        lifestyle: {
          familySize: 2,
          children: 0,
          pets: false,
          hobbies: ['독서'],
          workStyle: 'remote' as const,
          socialPreferences: ['조용함'],
        },
        budget: {
          targetPrice: 1000000000,
          currentSavings: 200000000,
          monthlyIncome: 5000000,
          loanAmount: 800000000,
          downPayment: 200000000,
        },
        timeline: {
          targetYear: 2025,
          currentProgress: 0,
          milestones: [],
        },
        investment: {
          currentValue: 1000000000,
          projectedValue: 1200000000,
          appreciationRate: 3.5,
          rentalPotential: 5000000,
          roi: 10.0,
        },
      };

      const apartment = service.createDreamApartment(dreamData);
      const updated1 = service.updateProgress(apartment.id, 150);
      expect(updated1.timeline.currentProgress).toBe(100);

      const updated2 = service.updateProgress(apartment.id, -10);
      expect(updated2.timeline.currentProgress).toBe(0);
    });

    it('존재하지 않는 아파트 진행률 업데이트 시 에러', () => {
      expect(() => {
        service.updateProgress('nonexistent', 50);
      }).toThrow('Dream apartment not found');
    });
  });

  describe('마일스톤 완료', () => {
    it('마일스톤 완료 처리', () => {
      const dreamData = {
        userId: 'user_milestone',
        name: '마일스톤 테스트 아파트',
        description: '마일스톤 테스트',
        location: {
          region: '강남구',
          district: '역삼동',
          address: '서울시 강남구 역삼로',
        },
        specifications: {
          size: 85,
          rooms: 2,
          bathrooms: 1,
          parkingSpaces: 1,
          floor: 10,
          totalFloors: 20,
          direction: '남향',
          view: '도시뷰',
        },
        amenities: {
          interior: ['에어컨'],
          exterior: ['발코니'],
          community: ['헬스장'],
          smart: ['스마트 도어락'],
          eco: ['LED 조명'],
        },
        design: {
          style: 'modern' as const,
          colorScheme: '화이트',
          materials: ['대리석'],
          lighting: 'LED',
          furniture: ['소파'],
        },
        lifestyle: {
          familySize: 2,
          children: 0,
          pets: false,
          hobbies: ['독서'],
          workStyle: 'remote' as const,
          socialPreferences: ['조용함'],
        },
        budget: {
          targetPrice: 1000000000,
          currentSavings: 200000000,
          monthlyIncome: 5000000,
          loanAmount: 800000000,
          downPayment: 200000000,
        },
        timeline: {
          targetYear: 2025,
          currentProgress: 0,
          milestones: [
            {
              id: 'milestone1',
              name: '테스트 마일스톤',
              description: '테스트 마일스톤 설명',
              targetDate: new Date('2024-12-31'),
              completed: false,
              progress: 0,
            },
          ],
        },
        investment: {
          currentValue: 1000000000,
          projectedValue: 1200000000,
          appreciationRate: 3.5,
          rentalPotential: 5000000,
          roi: 10.0,
        },
      };

      const apartment = service.createDreamApartment(dreamData);
      const updated = service.completeMilestone(apartment.id, 'milestone1');

      const milestone = updated.timeline.milestones.find((m) => m.id === 'milestone1');
      expect(milestone).toBeDefined();
      if (milestone) {
        expect(milestone.completed).toBe(true);
        expect(milestone.progress).toBe(100);
      }
      expect(updated.updatedAt).toBeInstanceOf(Date);
    });

    it('존재하지 않는 아파트 마일스톤 완료 시 에러', () => {
      expect(() => {
        service.completeMilestone('nonexistent', 'milestone1');
      }).toThrow('Dream apartment not found');
    });
  });

  describe('조회 메서드', () => {
    it('사용자별 꿈의 아파트 조회', () => {
      const dreamData1 = {
        userId: 'user_filter',
        name: '필터 테스트 아파트 1',
        description: '필터 테스트 1',
        location: {
          region: '강남구',
          district: '역삼동',
          address: '서울시 강남구 역삼로',
        },
        specifications: {
          size: 85,
          rooms: 2,
          bathrooms: 1,
          parkingSpaces: 1,
          floor: 10,
          totalFloors: 20,
          direction: '남향',
          view: '도시뷰',
        },
        amenities: {
          interior: ['에어컨'],
          exterior: ['발코니'],
          community: ['헬스장'],
          smart: ['스마트 도어락'],
          eco: ['LED 조명'],
        },
        design: {
          style: 'modern' as const,
          colorScheme: '화이트',
          materials: ['대리석'],
          lighting: 'LED',
          furniture: ['소파'],
        },
        lifestyle: {
          familySize: 2,
          children: 0,
          pets: false,
          hobbies: ['독서'],
          workStyle: 'remote' as const,
          socialPreferences: ['조용함'],
        },
        budget: {
          targetPrice: 1000000000,
          currentSavings: 200000000,
          monthlyIncome: 5000000,
          loanAmount: 800000000,
          downPayment: 200000000,
        },
        timeline: {
          targetYear: 2025,
          currentProgress: 0,
          milestones: [],
        },
        investment: {
          currentValue: 1000000000,
          projectedValue: 1200000000,
          appreciationRate: 3.5,
          rentalPotential: 5000000,
          roi: 10.0,
        },
      };

      const dreamData2 = {
        userId: 'user_filter2',
        name: '필터 테스트 아파트 2',
        description: '필터 테스트 2',
        location: {
          region: '서초구',
          district: '반포동',
          address: '서울시 서초구 반포대로',
        },
        specifications: {
          size: 100,
          rooms: 3,
          bathrooms: 2,
          parkingSpaces: 2,
          floor: 15,
          totalFloors: 30,
          direction: '남동향',
          view: '한강뷰',
        },
        amenities: {
          interior: ['에어컨', '정수기'],
          exterior: ['발코니', '테라스'],
          community: ['헬스장', '수영장'],
          smart: ['스마트 도어락', '스마트 조명'],
          eco: ['LED 조명', '태양광'],
        },
        design: {
          style: 'luxury' as const,
          colorScheme: '골드 & 화이트',
          materials: ['대리석', '원목'],
          lighting: '스마트 LED',
          furniture: ['럭셔리 소파', '미니멀 테이블'],
        },
        lifestyle: {
          familySize: 4,
          children: 2,
          pets: true,
          hobbies: ['독서', '요리'],
          workStyle: 'hybrid' as const,
          socialPreferences: ['커뮤니티 활동'],
        },
        budget: {
          targetPrice: 2000000000,
          currentSavings: 500000000,
          monthlyIncome: 8000000,
          loanAmount: 1500000000,
          downPayment: 500000000,
        },
        timeline: {
          targetYear: 2026,
          currentProgress: 20,
          milestones: [],
        },
        investment: {
          currentValue: 2000000000,
          projectedValue: 2500000000,
          appreciationRate: 5.0,
          rentalPotential: 8000000,
          roi: 12.5,
        },
      };

      service.createDreamApartment(dreamData1);
      service.createDreamApartment(dreamData2);

      const userApartments = service.getDreamApartments('user_filter');
      expect(userApartments.every((a) => a.userId === 'user_filter')).toBe(true);
    });

    it('전체 꿈의 아파트 조회', () => {
      const allApartments = service.getDreamApartments();
      expect(Array.isArray(allApartments)).toBe(true);
    });

    it('비전 보드 조회', () => {
      const visionBoards = service.getVisionBoards();
      expect(Array.isArray(visionBoards)).toBe(true);
    });

    it('특정 아파트의 비전 보드 조회', () => {
      const visionBoards = service.getVisionBoards('1');
      expect(Array.isArray(visionBoards)).toBe(true);
      if (visionBoards.length > 0) {
        expect(visionBoards.every((v) => v.dreamApartmentId === '1')).toBe(true);
      }
    });

    it('로드맵 조회', () => {
      const roadmaps = service.getRoadmaps();
      expect(Array.isArray(roadmaps)).toBe(true);
    });

    it('특정 아파트의 로드맵 조회', () => {
      const roadmaps = service.getRoadmaps('1');
      expect(Array.isArray(roadmaps)).toBe(true);
      if (roadmaps.length > 0) {
        expect(roadmaps.every((r) => r.dreamApartmentId === '1')).toBe(true);
      }
    });

    it('미래 설계 조회', () => {
      const designs = service.getFutureDesigns();
      expect(Array.isArray(designs)).toBe(true);
    });

    it('꿈 분석 조회', () => {
      const dreamData = {
        userId: 'user_analysis2',
        name: '분석 조회 테스트 아파트',
        description: '분석 조회 테스트',
        location: {
          region: '강남구',
          district: '역삼동',
          address: '서울시 강남구 역삼로',
        },
        specifications: {
          size: 85,
          rooms: 2,
          bathrooms: 1,
          parkingSpaces: 1,
          floor: 10,
          totalFloors: 20,
          direction: '남향',
          view: '도시뷰',
        },
        amenities: {
          interior: ['에어컨'],
          exterior: ['발코니'],
          community: ['헬스장'],
          smart: ['스마트 도어락'],
          eco: ['LED 조명'],
        },
        design: {
          style: 'modern' as const,
          colorScheme: '화이트',
          materials: ['대리석'],
          lighting: 'LED',
          furniture: ['소파'],
        },
        lifestyle: {
          familySize: 2,
          children: 0,
          pets: false,
          hobbies: ['독서'],
          workStyle: 'remote' as const,
          socialPreferences: ['조용함'],
        },
        budget: {
          targetPrice: 1000000000,
          currentSavings: 300000000,
          monthlyIncome: 6000000,
          loanAmount: 700000000,
          downPayment: 300000000,
        },
        timeline: {
          targetYear: 2025,
          currentProgress: 0,
          milestones: [],
        },
        investment: {
          currentValue: 1000000000,
          projectedValue: 1200000000,
          appreciationRate: 3.5,
          rentalPotential: 5000000,
          roi: 10.0,
        },
      };

      const apartment = service.createDreamApartment(dreamData);
      service.analyzeDreamFeasibility(apartment.id);

      const analysis = service.getDreamAnalysis(apartment.id);
      expect(analysis).toBeDefined();
      expect(analysis?.dreamApartmentId).toBe(apartment.id);
    });

    it('존재하지 않는 아파트 분석 조회 시 null 반환', () => {
      const analysis = service.getDreamAnalysis('nonexistent');
      expect(analysis).toBeNull();
    });
  });
});

