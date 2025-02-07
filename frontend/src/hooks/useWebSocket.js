import { useEffect, useRef, useState, useCallback } from 'react';

export const useWebSocket = (url) => {
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);

    const connect = useCallback(() => {
        try {
            wsRef.current = new WebSocket(url);

            wsRef.current.onopen = () => {
                setIsConnected(true);
                setError(null);
            };

            wsRef.current.onclose = () => {
                setIsConnected(false);
                // Attempt to reconnect after 3 seconds
                reconnectTimeoutRef.current = setTimeout(connect, 3000);
            };

            wsRef.current.onerror = (error) => {
                setError('WebSocket error occurred');
                console.error('WebSocket error:', error);
            };

        } catch (err) {
            setError(err.message);
            console.error('WebSocket connection error:', err);
        }
    }, [url]);

    useEffect(() => {
        connect();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [connect]);

    const sendMessage = useCallback((data) => {
        if (wsRef.current && isConnected) {
            wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
        }
    }, [isConnected]);

    const addMessageListener = useCallback((callback) => {
        if (wsRef.current) {
            wsRef.current.addEventListener('message', (event) => {
                try {
                    const data = JSON.parse(event.data);
                    callback(data);
                } catch (err) {
                    callback(event.data);
                }
            });
        }
    }, []);

    return {
        isConnected,
        error,
        sendMessage,
        addMessageListener
    };
};