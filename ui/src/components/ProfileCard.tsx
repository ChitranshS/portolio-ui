import React from 'react';

const ProfileCard = () => {
  return (
    <div className="bg-[#13131a] rounded-2xl p-6">
      <div className="flex items-center gap-4 mb-4">
        <img
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80"
          alt="Profile"
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold">Massbory</h2>
          <p className="text-gray-400 text-sm">Creating Regions Pro Markets</p>
        </div>
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">
        The fastest guide and all sort to see managing, attention e more and int year.
        The What it reginger to! to! spend and over pretty to at of ship are at done...
      </p>
    </div>
  );
};

export default ProfileCard;