import React from 'react';
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
import ProtectedRoute from './components/ProtectedRoute';
import Admin from './pages/Admin';
import Scheduled from './pages/Scheduled';
import { ToastContainer } from "react-toastify";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen mt-20 bg-slate-600">
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
      <main className="flex-grow pt-3 pb-0 overflow-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/SignIn" element={<SignIn />} />
          <Route path="/SignOut" element={<SignOut />} />
          <Route path="/SendOTP" element={<SendOTP />} />
          <Route path="/VerifyOTP" element={<VerifyOTP />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route element={<ProtectedRoute/>}>
            <Route path="/Profile" element={<Profile/>}/>
            <Route path="/Admin" element={<Admin/>}/>
            <Route path="Scheduled" element={<Scheduled/>}/>
          </Route>
        </Routes>
      </main>
      <Footer />
    </div>
  );
}