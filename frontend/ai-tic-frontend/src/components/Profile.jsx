import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [file, setFile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("access");
      const res = await axios.get("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
      setUsername(res.data.username);
      setEmail(res.data.email);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const token = localStorage.getItem("access");
    const form = new FormData();
    form.append("avatar", file);

    try {
      const res = await axios.put("http://127.0.0.1:8000/api/profile/", form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile(res.data);
      setFile(null);
      toast.success("Avatar uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!username || !email) return;
    setSaving(true);

    try {
      const token = localStorage.getItem("access");
      const res = await axios.put(
        "http://127.0.0.1:8000/api/profile/",
        { username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(res.data);
      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <div className="animate-pulse text-xl text-blue-500 font-bold">Loading Player Profile...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto mt-8 p-8 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl rounded-2xl border border-yellow-400/20">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-yellow-400 bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 inline-block">
          Player Profile
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto mt-2 rounded-full"></div>
      </div>

      {/* Profile Card */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-yellow-400/10 mb-8">
        <div className="flex items-center gap-6">
          {/* Avatar Section */}
          <div className="relative group">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full opacity-75 group-hover:opacity-100 blur transition-all duration-300"></div>
            {file ? (
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-300"
              />
            ) : profile.avatar ? (
              <img
                src={
                  profile.avatar.startsWith("http")
                    ? profile.avatar
                    : `http://127.0.0.1:8000${profile.avatar}`
                }
                alt="avatar"
                className="relative w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white border-4 border-white shadow-lg transform group-hover:scale-105 transition-transform duration-300">
                {profile.username?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveChanges}
                    disabled={saving}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {saving ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-6 py-2 bg-gray-700 text-gray-300 border border-gray-600 rounded-lg font-semibold hover:bg-gray-600 hover:text-white transition-all duration-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  {profile.username}
                </h2>
                <p className="text-gray-300 text-lg">{profile.email}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Games", value: profile.total_games, color: "from-blue-500 to-cyan-500" },
          { label: "Wins", value: profile.wins, color: "from-green-500 to-emerald-500" },
          { label: "Losses", value: profile.losses, color: "from-red-500 to-orange-500" },
          { label: "Draws", value: profile.draws, color: "from-purple-500 to-pink-500" },
          { label: "Win Rate", value: `${profile.win_rate}%`, color: "from-yellow-400 to-yellow-500" },
          { label: "Current Streak", value: profile.current_streak, color: "from-cyan-500 to-blue-500" },
          { label: "Best Streak", value: profile.best_streak, color: "from-emerald-500 to-green-500" },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group cursor-pointer"
          >
            <div className="text-center">
              <div className={`text-2xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300`}>
                {stat.value}
              </div>
              <div className="text-gray-300 text-sm font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Avatar Upload Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600 shadow-lg">
        <h3 className="text-xl font-bold text-yellow-400 mb-4">Change Avatar</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex items-center gap-4">
            <label className="flex-1">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden"
                id="avatar-upload"
              />
              <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-gray-600 transition-all duration-300">
                <span className="text-gray-300">
                  {file ? file.name : "Choose an image file"}
                </span>
              </div>
            </label>
            <button
              type="submit"
              disabled={!file || uploading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </span>
              ) : (
                "Upload Avatar"
              )}
            </button>
          </div>
          {file && (
            <p className="text-green-400 text-sm">
              ✓ Ready to upload: {file.name}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Profile;