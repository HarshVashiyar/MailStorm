import { AuthProvider } from './context/authContext';
import MouseGradient from './components/MouseGradient';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import SignOut from './pages/SignOut';
import Profile from './pages/Profile';
import SendOTP from './pages/SendOTP';
import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import AdminRefactored from './pages/AdminRefactored';
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen relative overflow-x-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 text-white">
        {/* Animated background gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary-500/10 via-accent-500/5 to-primary-600/10 animate-pulse-slow"></div>
        <div className="fixed inset-0 bg-gradient-radial from-primary-400/20 via-transparent to-transparent"></div>

        <MouseGradient />
        <div className="mt-20" />
        <ToastContainer
          className={"mt-20"}
          //position="top-center"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{ fontSize: '1.25rem' }}
        />
        <Navbar />
        <main className="flex flex-col min-h-screen pt-3 pb-0 overflow-auto relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/SignUp" element={<SignUp />} />
            <Route path="/SignIn" element={<SignIn />} />
            <Route path="/SignOut" element={<SignOut />} />
            <Route path="/SendOTP" element={<SendOTP />} />
            <Route path="/VerifyOTP" element={<VerifyOTP />} />
            <Route path="/ResetPassword" element={<ResetPassword />} />
            <Route path="/Admin" element={<AdminRefactored />} />
            <Route path="/Profile" element={<Profile />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}