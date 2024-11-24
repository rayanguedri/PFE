import { useNavigate, useParams } from "react-router-dom";
import agent from "../../app/api/agent";
import { useState } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordForm() {
    const { token } = useParams<{ token: string }>(); // Ensure token is of type string
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleResetPassword = () => {
        if (!token || !email) {
            console.error('Token or email is undefined');
            return;
        }

        agent.Account.resetPassword(token, email, password)
            .then(() => {
                console.log('Password reset successful');
                toast.success('Password reset successful');
                navigate('/');
            })
            .catch(error => {
                console.error('Password reset failed:', error);
                toast.error(`Password reset failed: ${error.message}`);
            });
    };

    return (
        <div>
            <h2>Reset Password</h2>
            <input 
                type="email" 
                value={email} 
                onChange={handleEmailChange} 
                placeholder="Enter your email"
            />
            <input 
                type="password" 
                value={password} 
                onChange={handlePasswordChange} 
                placeholder="Enter new password"
            />
            <button onClick={handleResetPassword}>Reset Password</button>

            <ToastContainer />
        </div>
    );
}