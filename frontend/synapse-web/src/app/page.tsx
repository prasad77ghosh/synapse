import React from "react";
import LoginForm from "./components/auth/Login";
import SignupForm from "./components/auth/Register";

const Home = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <LoginForm />
      {/* <SignupForm/> */}
    </div>
  );
};

export default Home;
