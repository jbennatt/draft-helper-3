import React, { useState, useEffect, useRef } from 'react';
/**
 * see: https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 * 
 * @param {*} callback 
 * @param {*} delay 
 */
export const useInterval = (callback, delay) => {

  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}