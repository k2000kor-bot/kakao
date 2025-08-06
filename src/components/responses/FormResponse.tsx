import React, { useState } from 'react';
import { Message } from '../../types/chat';

interface FormResponseProps {
  message: Message;
  onAction?: (action: string, data: any) => void;
}

const FormResponse: React.FC<FormResponseProps> = ({ message, onAction }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
    
    // 에러 클리어
    if (errors[fieldId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    message.form?.fields?.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id] === '')) {
        newErrors[field.id] = `${field.label}은(는) 필수입니다.`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onAction?.('form_submit', {
        formId: message.id,
        data: formData,
        action: message.form?.submitAction
      });
    }
  };

  const renderField = (field: any) => {
    const fieldError = errors[field.id];
    
    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldError ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={formData[field.id] || ''}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldError ? 'border-red-300' : 'border-gray-300'
              }`}
              aria-label={field.label}
            >
              <option value="">선택하세요</option>
              {field.options?.map((option: string) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      case 'radio':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name={field.id}
                    value={option}
                    checked={formData[field.id] === option}
                    onChange={(e) => handleInputChange(field.id, e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="space-y-2">
              {field.options?.map((option: string) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    value={option}
                    checked={formData[field.id]?.includes(option) || false}
                    onChange={(e) => {
                      const currentValues = formData[field.id] || [];
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleInputChange(field.id, newValues);
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">{option}</span>
                </label>
              ))}
            </div>
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      case 'rating':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleInputChange(field.id, star)}
                  className={`text-2xl ${
                    (formData[field.id] || 0) >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {fieldError && (
              <p className="text-xs text-red-500 mt-1">{fieldError}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="form-response bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200 card-corbu">
      <div className="flex items-start space-x-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold text-purple-900 mb-1">
            폼
          </div>
          <div className="text-sm text-gray-700">
            {message.content}
          </div>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
        {message.form?.fields?.map(renderField)}
        
        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={() => onAction?.('form_cancel', { formId: message.id })}
            className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          >
            취소
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            제출
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormResponse; 