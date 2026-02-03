import { useState, useCallback } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (method, endpoint, data = null) => {
    setLoading(true);
    setError(null);
    
    try {
      const url = `${process.env.REACT_APP_API_BASE_URL}${endpoint}`;
      console.log(`${method} ${url}`, data);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        ...(data && { body: JSON.stringify(data) })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const responseData = await response.json();
      return responseData;
    } catch (err) {
      console.error('API Error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const api = {
    // Получить доступные элементы
    getAvailable: (offset = 0, limit = 20, search = '') => 
      request('GET', `/available?offset=${offset}&limit=${limit}&search=${search}`),
    
    // Получить выбранные элементы
    getSelected: (offset = 0, limit = 20, search = '') =>
      request('GET', `/selected?offset=${offset}&limit=${limit}&search=${search}`),
    
    // Добавить новый элемент
    addItem: (customId) =>
      request('POST', '/', { customId }),
    
    // Выбрать элемент
    selectItem: (itemId) =>
      request('POST', `/${itemId}/select`),
    
    // Убрать из выбранных
    deselectItem: (itemId) =>
      request('DELETE', `/${itemId}/select`),
    
    // Обновить порядок
    updateOrder: (order) =>
      request('PUT', '/selected/order', { order })
  };

  return {
    api,
    loading,
    error
  };
}