import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SignOut = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    toast.success("You have been signed out.");
    navigate("/");
  };

  return (
    <div className="flex flex-col min-h-screen items-center m-2">
      <button
        className="bg-blue-500 text-white p-2 rounded-md w-fit"
        onClick={handleSignOut}
      >
        Sign Out
      </button>
    </div>
  );
};

export default SignOut;
