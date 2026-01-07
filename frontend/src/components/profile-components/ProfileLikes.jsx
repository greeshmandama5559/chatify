import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfileLikes = ({ authUser, likedUsers }) => {
  const [showModal, setShowModal] = useState(false);

  // Logic to handle display limits
  const displayLimit = 4;
  const visibleUsers = likedUsers.slice(0, displayLimit);
  const remainingCount = authUser?.likesCount - displayLimit;

  const navigate = useNavigate();

  return (
    <div className="relative">
      {/* Likes Text */}
      <p className="text-md text-slate-400 mb-4">
        Your profile has{" "}
        <span className="text-cyan-400 font-semibold">
          {authUser?.likesCount} {authUser?.likesCount === 1 ? "like" : "likes"}
        </span>
      </p>

      {/* Avatar Stack - Clickable */}
      <div 
        className="mt-2 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setShowModal(true)}
      >
        <div className="flex -space-x-3">
          {visibleUsers.map((like) => (
            <div
              key={like._id}
              className="w-10 h-10 rounded-full border-2 border-[#050505] bg-slate-800 overflow-hidden"
            >
              <img
                src={like.likedBy.profilePic}
                alt="user"
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Dynamic Plus Counter */}
          {remainingCount > 0 && (
            <div className="w-10 h-10 rounded-full border-2 border-[#050505] bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">
              +{remainingCount > 999 ? (remainingCount / 1000).toFixed(1) + "k" : remainingCount}
            </div>
          )}
        </div>
      </div>

      {/* Details Box (Modal) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-white font-bold text-lg">Liked by</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                &times;
              </button>
            </div>
            
            <div className="max-h-70 overflow-y-auto p-2">
              {likedUsers.map((like) => (
                <div 
                key={like._id} 
                onClick={() => {
                    navigate(`/user-profile/${like.likedBy._id}`);
                }}
                className="flex items-center space-x-3 p-3 hover:bg-slate-800 rounded-lg cursor-pointer">
                  <img 
                    src={like.likedBy.profilePic} 
                    className="w-10 h-10 rounded-full" 
                    alt={like.likedBy.fullName} 
                  />
                  <div>
                    <p className="text-white font-medium hover:text-cyan-400">{like.likedBy.fullName}</p>
                    <p className="text-slate-500 text-sm">View Profile</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Click outside to close */}
          <div className="fixed inset-0 -z-10" onClick={() => setShowModal(false)}></div>
        </div>
      )}
    </div>
  );
};

export default ProfileLikes;