import { useState, useEffect } from "react";

const ProfileAvatar = ({ fullName, size = "lg", editable = false, onPhotoChange, photoUrl, onPhotoDelete }) => {
  const [imageUrl, setImageUrl] = useState(photoUrl || null);
  const [imageError, setImageError] = useState(false);
  
  // Update imageUrl when photoUrl prop changes
  useEffect(() => {
    if (photoUrl) {
      setImageUrl(photoUrl);
      setImageError(false);
    } else {
      setImageUrl(null);
      setImageError(false);
    }
  }, [photoUrl]);

  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const getGradientColor = (name) => {
    const colors = [
      "from-primary-500 to-accent-500",
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500",
      "from-green-500 to-teal-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
    ];
    const index = (name?.charCodeAt(0) || 0) % colors.length;
    return colors[index];
  };

  const sizeClasses = {
    sm: "w-16 h-16 text-xl",
    md: "w-24 h-24 text-3xl",
    lg: "w-32 h-32 text-4xl",
    xl: "w-40 h-40 text-5xl",
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onPhotoChange) {
      onPhotoChange(file);
    }
  };

  return (
    <div className="relative">
      <div className="relative group">
        <div
          className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-white/10 shadow-glow-lg relative`}
        >
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={fullName}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div
              className={`w-full h-full bg-gradient-to-br ${getGradientColor(
                fullName
              )} flex items-center justify-center font-bold text-white`}
            >
              {getInitials(fullName)}
            </div>
          )}

          {/* Hover overlay for editable */}
          {editable && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* File input for editable mode */}
        {editable && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Upload profile photo"
          />
        )}

        {/* Animated ring */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 rounded-full opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300 -z-10 animate-pulse-slow"></div>
      </div>
      
      {/* Delete button - only show if there's a photo and component is editable */}
      {editable && imageUrl && !imageError && onPhotoDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPhotoDelete();
          }}
          className="absolute -bottom-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-all duration-300 hover:scale-110 z-20"
          title="Delete profile photo"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ProfileAvatar;
