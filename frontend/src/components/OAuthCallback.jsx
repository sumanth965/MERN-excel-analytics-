// OAuthCallback.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthCallback = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (token) {
      localStorage.setItem('authToken', token);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, []);
  return <div>Loading...</div>;
};

export default OAuthCallback;
