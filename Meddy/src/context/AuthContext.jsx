import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState(null);
  const [role, setRole] = useState(null);
  // const API_BASE_URL = 'http://192.168.24.32:8000';
  const API_BASE_URL = 'https://benjacobkoshy.pythonanywhere.com';

  const login = async (accessToken, refreshToken, role) => {
    setIsLoading(true);

    console.log("Role of user",role);

    if (!accessToken || !refreshToken || !role) {
      console.error('Tokens and role are missing, cannot save to AsyncStorage');
      setIsLoading(false);
      return;
    }

    setUserToken(accessToken);
    setRole(role);

    try {
      await AsyncStorage.setItem('userToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('role',role);
    } catch (error) {
      console.error('Failed to save tokens to AsyncStorage', error);
    }

    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setRole(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('role');
    setIsLoading(false);
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('Refresh token not found');

      const response = await fetch(`${API_BASE_URL}/auth/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        const newAccessToken = data.access;

        setUserToken(newAccessToken);
        await AsyncStorage.setItem('userToken', newAccessToken);
        return newAccessToken;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout(); // Logout if refresh fails
    }
  };



  const fetchWithAuth = async (url, options = {}) => {
    let token = userToken;
    // const baseUrl = 'http://192.168.28.32:8000/';
    const actualUrl = `${API_BASE_URL}/${url}`;
    console.log(actualUrl);  
    try {
      const response = await fetch(actualUrl, {
        ...options,
        headers: {
          ...(options.headers || {}),
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json', // Make sure to send JSON data
        },
      });
  
      if (response.status === 401) {
        // Attempt to refresh the token
        token = await refreshAccessToken();
        if (token) {
          // Retry the request with the new token
          return await fetch(actualUrl, {
            ...options,
            headers: {
              ...(options.headers || {}),
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
        } else {
          throw new Error('Failed to refresh token, user is unauthorized');
        }
      }
  
      // If the response is successful, return the parsed JSON response
      return response;
    } catch (error) {
      console.error('Error in fetchWithAuth:', error);
      throw error;
    }
  };
  


  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const savedRole = await AsyncStorage.getItem('role');

      if (token && refreshToken) {
        const newToken = await refreshAccessToken();
        setUserToken(newToken || token);
        setRole(savedRole);

      }
    } catch (error) {
      console.error('Error retrieving tokens from AsyncStorage', error);
    }finally{
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  

  return (
    <AuthContext.Provider value={{ login, logout, fetchWithAuth, refreshAccessToken, userToken, isLoading, role, API_BASE_URL }}>
      {children}
    </AuthContext.Provider>
  );
};
