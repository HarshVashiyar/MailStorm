import { useState, useEffect } from "react";
import axios from "axios";
import SignOut from "./SignOut";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const decodedToken = JSON.parse(atob(token.split(".")[1]));
        const userId = decodedToken.id;

        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_BASE_URL}user/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = response.data;
        setUser(data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  const handleGoToAdmin = () => {
    navigate("/Admin");
  };

  return user ? (
    <div className="flex flex-col min-h-screen">
      <div className="p-8 max-w-xl mx-auto bg-white shadow rounded-lg">
        <h1 className="text-4xl font-bold mb-4">Profile</h1>
        <p className="text-2xl mb-2">
          <strong>Full Name:</strong> {user.fullName}
        </p>
        <p className="text-2xl mb-2">
          <strong>Username:</strong> {user.userName}
        </p>
        <p className="text-2xl mb-2">
          <strong>Email:</strong> {user.email}
        </p>
        <p className="text-2xl mb-2">
          <strong>Role:</strong> {user.role}
        </p>
        <p className="text-2xl mb-2">
          <strong>Account Created:</strong>{" "}
          {new Date(user.createdAt).toLocaleString()}
        </p>
        <p className="text-2xl">
          <strong>Last Updated:</strong>{" "}
          {new Date(user.updatedAt).toLocaleString()}
        </p>
      </div>
      <div className="flex justify-center items-center m-4">
        {user.role === "Admin" && (
          <button
            className="bg-green-500 text-white p-2 rounded-md mt-4"
            onClick={handleGoToAdmin}
          >
            Go to Admin Page
          </button>
        )}
      </div>
      <SignOut />
    </div>
  ) : (
    <div className="p-8 text-center text-2xl">Loading...</div>
  );
};

export default Profile;
