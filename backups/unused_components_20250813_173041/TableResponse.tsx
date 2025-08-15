import React, { useState } from 'react';
import { Message } from '../../types/chat';

interface TableResponseProps {
  message: Message;
}

const TableResponse: React.FC<TableResponseProps> = ({ message }) => {
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (columnIndex: number) => {
    if (sortColumn === columnIndex) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnIndex);
      setSortDirection('asc');
    }
  };

  const getSortedAndFilteredData = () => {
    if (!message.table?.rows) return [];

    let filteredRows = message.table.rows;

    // 검색 필터링
    if (searchTerm && message.table.searchable) {
      filteredRows = filteredRows.filter(row =>
        row.some(cell => cell.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // 정렬
    if (sortColumn !== null && message.table.sortable) {
      filteredRows = [...filteredRows].sort((a, b) => {
        const aValue = a[sortColumn] || '';
        const bValue = b[sortColumn] || '';

        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return filteredRows;
  };

  const getSortIcon = (columnIndex: number) => {
    if (sortColumn !== columnIndex) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (!message.table?.headers || !message.table?.rows) {
    return (
      <div className="table-response bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 card-corbu">
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-sm">테이블 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const sortedAndFilteredData = getSortedAndFilteredData();

  return (
    <div className="table-response bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200 card-corbu">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold text-gray-900">
              테이블
            </div>
            <div className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
              {message.table.rows.length}행
            </div>
          </div>

          <div className="text-sm text-gray-700 mb-3">
            {message.content}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        {/* 검색 바 */}
        {message.table.searchable && (
          <div className="p-3 border-b bg-gray-50">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="테이블 검색..."
                className="w-full px-3 py-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <svg className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {message.table.headers.map((header, index) => (
                  <th
                    key={index}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider ${message.table?.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                      }`}
                    onClick={() => message.table?.sortable && handleSort(index)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{header}</span>
                      {message.table?.sortable && getSortIcon(index)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAndFilteredData.length > 0 ? (
                sortedAndFilteredData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-gray-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-gray-900">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={message.table.headers.length}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    {searchTerm ? '검색 결과가 없습니다.' : '데이터가 없습니다.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 결과 요약 */}
        {searchTerm && (
          <div className="p-3 border-t bg-gray-50 text-xs text-gray-600">
            {sortedAndFilteredData.length}개 결과 (전체 {message.table.rows.length}개)
          </div>
        )}
      </div>
    </div>
  );
};

export default TableResponse; 