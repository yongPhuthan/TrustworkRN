import { useCallback } from 'react';


export const useUriToBlob = () => {
    const uriToBlob = useCallback((uri: string) => {
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          resolve(xhr.response);
        };
        xhr.onerror = function () {
          reject(new Error('URI to Blob failed'));
        };
        xhr.responseType = 'blob';
        xhr.open('GET', uri, true);
        xhr.send(null);
      });
    }, []);
  
    return uriToBlob;
  };