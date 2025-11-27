import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const Profile = () => {
    const { logout } = useAuth();
    const [user, setUser] = useState(null);
    const [myRecipes, setMyRecipes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, recipesRes] = await Promise.all([
                    api.get('/user/profile'),
                    api.get('/recipe/getAllRecipe')
                ]);

                setUser(profileRes.data);
                // Filter recipes for current user
                const userRecipes = recipesRes.data.filter(r => r.userId === profileRes.data.id);
                setMyRecipes(userRecipes);
            } catch (err) {
                console.error("Failed to fetch data", err);
                setError("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark flex items-center justify-center">
                <div className="text-gray-900 dark:text-white text-xl">Loading profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white dark:bg-dark flex items-center justify-center">
                <div className="text-red-500 text-xl">{error}</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-light transition-colors duration-200">
            <Navbar />
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-8 shadow-lg">
                        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 h-32"></div>
                        <div className="px-8 pb-8">
                            <div className="relative -mt-16 mb-6 flex justify-between items-end">
                                <div className="h-32 w-32 rounded-full bg-white dark:bg-gray-700 border-4 border-gray-100 dark:border-gray-800 flex items-center justify-center text-gray-900 dark:text-white text-4xl font-bold shadow-md">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>
                                <button
                                    onClick={logout}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors mb-4 shadow-md"
                                >
                                    Sign Out
                                </button>
                            </div>

                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{user.username}</h1>
                            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-6">
                                <Mail className="h-4 w-4 mr-2" />
                                {user.email}
                            </div>

                            <div className="flex gap-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.followers?.length || 0}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Followers</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{user.following?.length || 0}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Following</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{myRecipes.length}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Recipes</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Recipes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {myRecipes.map(recipe => (
                            <div key={recipe.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 flex shadow-md hover:shadow-lg transition-shadow">
                                <img
                                    src={recipe.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop"}
                                    alt={recipe.title}
                                    className="w-32 h-32 object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop";
                                    }}
                                />
                                <div className="p-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1">{recipe.title}</h3>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                                            <span className="flex items-center"><Star className="h-3 w-3 mr-1 text-yellow-400" /> {recipe.likedUserIds?.length || 0}</span>
                                            <span>{new Date(recipe.createdAt || Date.now()).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <a href={`/recipe/${recipe.id}`} className="text-primary hover:text-orange-600 dark:hover:text-orange-400 text-sm font-medium">View</a>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {myRecipes.length === 0 && (
                            <div className="col-span-2 text-center py-12 bg-gray-100 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 border-dashed">
                                <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't published any recipes yet.</p>
                                <a href="/create-recipe" className="text-primary hover:underline">Create your first recipe</a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
