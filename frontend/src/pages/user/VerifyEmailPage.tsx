import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../../utils/api';
import './AuthPages.css';
const VerifyEmailPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('');
  useEffect(() => {
    API.get(`/auth/verify-email/${token}`).then(({data})=>{setStatus('success');setMessage(data.message);}).catch(err=>{setStatus('error');setMessage(err.response?.data?.message||'Verification failed');});
  }, [token]);
  return (
    <div className="auth-page"><div className="auth-card" style={{textAlign:'center'}}>
      <div className="auth-logo">Electronic Shop</div>
      {status==='loading'&&<><div className="spinner" style={{margin:'0 auto 20px'}}/><p>Verifying...</p></>}
      {status==='success'&&<><div style={{fontSize:64}}></div><h2>Email Verified!</h2><p style={{color:'var(--gray-500)',margin:'12px 0 24px'}}>{message}</p><Link to="/login" className="btn btn-primary btn-lg">Go to Login</Link></>}
      {status==='error'&&<><div style={{fontSize:64}}></div><h2>Verification Failed</h2><p style={{color:'var(--gray-500)',margin:'12px 0 24px'}}>{message}</p><Link to="/login" className="btn btn-primary">Back to Login</Link></>}
    </div></div>
  );
};
export default VerifyEmailPage;
