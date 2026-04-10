/**
 * 부동산 실거래 및 등기 정보 패널
 * 조합원들에게 정보 제공
 */

import React, { useState, useEffect, useCallback } from 'react';
import molitRealEstateService, {
  type RealEstateTransaction,
  type RealEstateSearchParams,
  type RealEstateStatistics,
} from '../services/molitRealEstateService';
import realEstateRegistryService, {
  type RegistryChange,
  type RegistrySearchParams,
  type RegistryStatistics,
} from '../services/realEstateRegistryService';
import { errorLogger } from '../utils/errorLogger';
import { showToast } from '../utils/toast';
import './RealEstateDataPanel.css';

interface RealEstateDataPanelProps {
  projectId?: string;
  onDataSelect?: (data: RealEstateTransaction | RegistryChange) => void;
}

const RealEstateDataPanel: React.FC<RealEstateDataPanelProps> = ({
  projectId: _projectId,
  onDataSelect,
}) => {
  const [activeTab, setActiveTab] = useState<'transaction' | 'registry'>('transaction');
  const [transactions, setTransactions] = useState<RealEstateTransaction[]>([]);
  const [registryChanges, setRegistryChanges] = useState<RegistryChange[]>([]);
  const [statistics, setStatistics] = useState<RealEstateStatistics | null>(null);
  const [registryStats, setRegistryStats] = useState<RegistryStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<RealEstateSearchParams>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });
  const [registrySearchParams, setRegistrySearchParams] = useState<RegistrySearchParams>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  // 실거래 정보 조회
  const handleSearchTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await molitRealEstateService.searchTransactions(searchParams);
      setTransactions(data);
      const stats = molitRealEstateService.calculateStatistics(data);
      setStatistics(stats);
    } catch (error) {
      errorLogger.error('실거래 정보 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'RealEstateDataPanel',
        action: 'searchTransactions',
        searchParams,
      });
      showToast('실거래 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  // 등기 변경 정보 조회
  const handleSearchRegistry = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await realEstateRegistryService.getRegistryChanges(registrySearchParams);
      setRegistryChanges(data);
      const stats = realEstateRegistryService.calculateStatistics(data);
      setRegistryStats(stats);
    } catch (error) {
      errorLogger.error('등기 변경 정보 조회 실패', error instanceof Error ? error : new Error(String(error)), {
        component: 'RealEstateDataPanel',
        action: 'getRegistryChanges',
        registrySearchParams,
      });
      showToast('등기 변경 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [registrySearchParams]);

  useEffect(() => {
    if (activeTab === 'transaction') {
      handleSearchTransactions();
    } else {
      handleSearchRegistry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const formatPrice = (amount: number, unit: string = '만원'): string => {
    if (unit === '만원') {
      return `${(amount / 10000).toLocaleString()}만원`;
    }
    return `${amount.toLocaleString()}${unit}`;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('ko-KR');
  };

  return (
    <div className="real-estate-data-panel" data-testid="real-estate-panel" role="region" aria-label="부동산 실거래 및 등기 정보">
      <div className="data-panel-header">
        <h3>부동산 실거래 및 등기 정보</h3>
        <div className="tab-buttons">
          <button
            type="button"
            className={`tab-button ${activeTab === 'transaction' ? 'active' : ''}`}
            onClick={() => setActiveTab('transaction')}
            aria-pressed={activeTab === 'transaction'}
            data-testid="real-estate-tab-transaction"
          >
            실거래 정보
          </button>
          <button
            type="button"
            className={`tab-button ${activeTab === 'registry' ? 'active' : ''}`}
            onClick={() => setActiveTab('registry')}
            aria-pressed={activeTab === 'registry'}
            data-testid="real-estate-tab-registry"
          >
            등기 변경 정보
          </button>
        </div>
      </div>

      {activeTab === 'transaction' && (
        <div className="transaction-panel">
          <div className="search-section">
            <div className="search-row">
              <label>시도:</label>
              <input
                type="text"
                value={searchParams.sido || ''}
                onChange={(e) => setSearchParams({ ...searchParams, sido: e.target.value })}
                placeholder="서울특별시"
              />
            </div>
            <div className="search-row">
              <label>시군구:</label>
              <input
                type="text"
                value={searchParams.sigungu || ''}
                onChange={(e) => setSearchParams({ ...searchParams, sigungu: e.target.value })}
                placeholder="강남구"
              />
            </div>
            <div className="search-row">
              <label>동:</label>
              <input
                type="text"
                value={searchParams.dong || ''}
                onChange={(e) => setSearchParams({ ...searchParams, dong: e.target.value })}
                placeholder="테헤란로"
              />
            </div>
            <div className="search-row">
              <label>거래유형:</label>
              <select
                value={searchParams.transactionType || ''}
                onChange={(e) => setSearchParams({ ...searchParams, transactionType: e.target.value })}
                aria-label="거래유형"
              >
                <option value="">전체</option>
                <option value="매매">매매</option>
                <option value="전세">전세</option>
                <option value="월세">월세</option>
              </select>
            </div>
            <div className="search-row">
              <label>매물유형:</label>
              <select
                value={searchParams.propertyType || ''}
                onChange={(e) => setSearchParams({ ...searchParams, propertyType: e.target.value })}
                aria-label="매물유형"
              >
                <option value="">전체</option>
                <option value="아파트">아파트</option>
                <option value="오피스텔">오피스텔</option>
                <option value="연립다세대">연립다세대</option>
                <option value="단독다가구">단독다가구</option>
              </select>
            </div>
            <div className="search-row">
              <label>기간:</label>
              <input
                type="date"
                value={searchParams.startDate || ''}
                onChange={(e) => setSearchParams({ ...searchParams, startDate: e.target.value })}
              />
              <span>~</span>
              <input
                type="date"
                value={searchParams.endDate || ''}
                onChange={(e) => setSearchParams({ ...searchParams, endDate: e.target.value })}
              />
            </div>
            <button
              type="button"
              className="search-button"
              onClick={handleSearchTransactions}
              disabled={isLoading}
              aria-label="실거래 정보 조회"
              aria-busy={isLoading}
              data-testid="real-estate-search-transactions"
            >
              {isLoading ? '조회 중...' : '조회'}
            </button>
          </div>

          {statistics && (
            <div className="statistics-section">
              <h4>통계 정보</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">거래 건수:</span>
                  <span className="stat-value">{statistics.transactionCount}건</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">평균 가격:</span>
                  <span className="stat-value">{formatPrice(statistics.averagePrice)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">최저 가격:</span>
                  <span className="stat-value">{formatPrice(statistics.priceRange.minPrice)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">최고 가격:</span>
                  <span className="stat-value">{formatPrice(statistics.priceRange.maxPrice)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">㎡당 가격:</span>
                  <span className="stat-value">{formatPrice(statistics.pricePerSquareMeter)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="data-list">
            <h4>실거래 목록 ({transactions.length}건)</h4>
            <div className="transaction-list">
              {transactions.length === 0 && !isLoading && (
                <p className="real-estate-empty-state" role="status" data-testid="real-estate-empty-transactions">
                  조건에 맞는 실거래 정보가 없습니다. 시도·시군구·동을 입력하거나 검색 조건을 완화해 보세요.
                </p>
              )}
              {transactions.map((transaction, idx) => (
                <div
                  key={transaction.id ?? `tx-${idx}`}
                  className="transaction-item"
                  onClick={() => onDataSelect?.(transaction)}
                >
                  <div className="item-header">
                    <span className="transaction-type">{transaction.transactionType}</span>
                    <span className="property-type">{transaction.propertyType}</span>
                    <span className="transaction-date">{formatDate(transaction.transactionDate)}</span>
                  </div>
                  <div className="item-address">
                    {transaction.address.sido} {transaction.address.sigungu} {transaction.address.dong}
                  </div>
                  <div className="item-details">
                    <span>가격: {formatPrice(transaction.price.amount)}</span>
                    <span>면적: {transaction.area.exclusive}㎡</span>
                    {transaction.floor && (
                      <span>{transaction.floor.current}/{transaction.floor.total}층</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'registry' && (
        <div className="registry-panel">
          <div className="search-section">
            <div className="search-row">
              <label>시도:</label>
              <input
                type="text"
                value={registrySearchParams.sido || ''}
                onChange={(e) => setRegistrySearchParams({ ...registrySearchParams, sido: e.target.value })}
                placeholder="서울특별시"
              />
            </div>
            <div className="search-row">
              <label>시군구:</label>
              <input
                type="text"
                value={registrySearchParams.sigungu || ''}
                onChange={(e) => setRegistrySearchParams({ ...registrySearchParams, sigungu: e.target.value })}
                placeholder="강남구"
              />
            </div>
            <div className="search-row">
              <label>동:</label>
              <input
                type="text"
                value={registrySearchParams.dong || ''}
                onChange={(e) => setRegistrySearchParams({ ...registrySearchParams, dong: e.target.value })}
                placeholder="테헤란로"
              />
            </div>
            <div className="search-row">
              <label>변경유형:</label>
              <select
                value={registrySearchParams.changeType || ''}
                onChange={(e) => setRegistrySearchParams({ ...registrySearchParams, changeType: e.target.value })}
                aria-label="변경유형"
              >
                <option value="">전체</option>
                <option value="소유권이전">소유권이전</option>
                <option value="저당권설정">저당권설정</option>
                <option value="저당권말소">저당권말소</option>
                <option value="전세권설정">전세권설정</option>
                <option value="전세권말소">전세권말소</option>
              </select>
            </div>
            <div className="search-row">
              <label>기간:</label>
              <input
                type="date"
                value={registrySearchParams.startDate || ''}
                onChange={(e) => setRegistrySearchParams({ ...registrySearchParams, startDate: e.target.value })}
              />
              <span>~</span>
              <input
                type="date"
                value={registrySearchParams.endDate || ''}
                onChange={(e) => setRegistrySearchParams({ ...registrySearchParams, endDate: e.target.value })}
              />
            </div>
            <button
              type="button"
              className="search-button"
              onClick={handleSearchRegistry}
              disabled={isLoading}
              aria-label="등기 변경 정보 조회"
              aria-busy={isLoading}
              data-testid="real-estate-search-registry"
            >
              {isLoading ? '조회 중...' : '조회'}
            </button>
          </div>

          {registryStats && (
            <div className="statistics-section">
              <h4>통계 정보</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">총 변경 건수:</span>
                  <span className="stat-value">{registryStats.totalChanges}건</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">소유권 이전:</span>
                  <span className="stat-value">{registryStats.ownershipChanges}건</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">저당권 변경:</span>
                  <span className="stat-value">{registryStats.mortgageChanges}건</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">전세권 변경:</span>
                  <span className="stat-value">{registryStats.leaseChanges}건</span>
                </div>
              </div>
            </div>
          )}

          <div className="data-list">
            <h4>등기 변경 목록 ({registryChanges.length}건)</h4>
            <div className="registry-list">
              {registryChanges.length === 0 && !isLoading && (
                <p className="real-estate-empty-state" role="status" data-testid="real-estate-empty-registry">
                  조건에 맞는 등기 변경 정보가 없습니다. 지역 또는 변경유형을 조정해 보세요.
                </p>
              )}
              {registryChanges.map((change, idx) => (
                <div
                  key={change.id ?? `reg-${idx}`}
                  className="registry-item"
                  onClick={() => onDataSelect?.(change)}
                >
                  <div className="item-header">
                    <span className="change-type">{change.changeType}</span>
                    <span className="change-date">{formatDate(change.changeDate)}</span>
                  </div>
                  <div className="item-address">
                    {change.propertyAddress.sido} {change.propertyAddress.sigungu} {change.propertyAddress.dong}
                  </div>
                  <div className="item-details">
                    {change.previousOwner && (
                      <span>이전: {change.previousOwner.name}</span>
                    )}
                    {change.newOwner && (
                      <span>신규: {change.newOwner.name}</span>
                    )}
                    {change.mortgageInfo && (
                      <span>채권자: {change.mortgageInfo.creditor}</span>
                    )}
                    {change.leaseInfo && (
                      <span>임차인: {change.leaseInfo.lessee}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealEstateDataPanel;
