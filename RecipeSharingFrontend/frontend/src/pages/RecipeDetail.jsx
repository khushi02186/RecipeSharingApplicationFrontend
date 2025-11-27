import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Clock, ChefHat, Star, ArrowLeft, Trash2, Edit, CheckCircle, Share2, MessageSquare, Send, UserPlus, UserCheck } from 'lucide-react';
import Navbar from '../components/Navbar';

const RecipeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [recipe, setRecipe] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [author, setAuthor] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        const fetchRecipeAndComments = async () => {
            try {
                const [recipeRes, commentsRes] = await Promise.all([
                    api.get(`/recipe/${id}`),
                    api.get(`/recipe/${id}/comments`)
                ]);

                setRecipe(recipeRes.data);
                setComments(commentsRes.data);

                if (user && recipeRes.data.likedUserIds) {
                    setIsLiked(recipeRes.data.likedUserIds.includes(user.id));
                }
                setLikeCount(recipeRes.data.likedUserIds?.length || 0);

                // Fetch Author Details
                if (recipeRes.data.userId) {
                    const authorRes = await api.get(`/user/${recipeRes.data.userId}`);
                    setAuthor(authorRes.data);
                    if (user && authorRes.data.followers) {
                        setIsFollowing(authorRes.data.followers.includes(user.id));
                    }
                }

            } catch (error) {
                console.error("Error fetching data", error);
                setError("Recipe not found");
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeAndComments();
    }, [id, user]);

    const handleDelete = async () => {
        if (window.confirm("Are you sure you want to delete this recipe?")) {
            try {
                await api.delete(`/recipe/delete/${id}`);
                navigate('/');
            } catch (error) {
                console.error("Error deleting recipe", error);
                alert("Failed to delete recipe");
            }
        }
    };

    const handleLike = async () => {
        if (!user) return alert("Please login to like recipes");
        try {
            await api.post(`/recipe/${id}/like`);
            setIsLiked(!isLiked);
            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (error) {
            console.error("Error liking recipe", error);
        }
    };

    const handleFollow = async () => {
        if (!user) return alert("Please login to follow users");
        if (!author) return;

        try {
            await api.post(`/user/${author.id}/follow`);
            setIsFollowing(!isFollowing);
            // Update local author state to reflect change immediately if needed, 
            // but for UI toggle !isFollowing is enough
        } catch (error) {
            console.error("Error following user", error);
            alert("Failed to update follow status");
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        if (!user) return alert("Please login to comment");

        try {
            const response = await api.post(`/recipe/${id}/comment`, { text: newComment });
            setComments([...comments, response.data]);
            setNewComment('');
        } catch (error) {
            console.error("Error posting comment", error);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
    };

    if (loading) return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error || !recipe) return (
        <div className="min-h-screen bg-dark flex flex-col items-center justify-center text-white">
            <h2 className="text-2xl font-bold mb-4">Recipe not found</h2>
            <Link to="/" className="text-primary hover:underline">Back to Home</Link>
        </div>
    );

    const isOwner = user && user.id === recipe.userId;

    return (
        <div className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-light pb-20 transition-colors duration-200">
            <Navbar />
            {/* Header Image */}
            <div className="relative h-[50vh] w-full">
                <img
                    src={recipe.imageUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop"}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop";
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-dark via-white/50 dark:via-dark/50 to-transparent" />

                <div className="absolute top-6 left-6 z-10">
                    <button onClick={() => navigate(-1)} className="bg-white/50 dark:bg-black/50 backdrop-blur-md p-2 rounded-full text-gray-900 dark:text-white hover:bg-primary transition-colors inline-flex">
                        <ArrowLeft className="h-6 w-6" />
                    </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{recipe.title}</h1>

                            {/* Author & Stats */}
                            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-4">
                                {author && (
                                    <div className="flex items-center space-x-3 bg-gray-800/80 px-4 py-2 rounded-full backdrop-blur-sm">
                                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                                            {author.username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-medium text-white">{author.username}</span>
                                        {!isOwner && user && (
                                            <button
                                                onClick={handleFollow}
                                                className={`ml-2 p-1 rounded-full transition-colors ${isFollowing ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-300 hover:text-white'}`}
                                                title={isFollowing ? "Unfollow" : "Follow"}
                                            >
                                                {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-6 text-gray-300">
                                <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <Clock className="h-5 w-5 text-primary" />
                                    <span>Prep: {recipe.prepTimeMinutes}m</span>
                                </div>
                                <div className="flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                    <Clock className="h-5 w-5 text-secondary" />
                                    <span>Cook: {recipe.cookTimeMinutes}m</span>
                                </div>
                                <button onClick={handleLike} className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors ${isLiked ? 'bg-red-500/20 text-red-500' : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700'}`}>
                                    <Star className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                                    <span>{likeCount} likes</span>
                                </button>
                                <button onClick={handleShare} className="flex items-center space-x-2 bg-gray-800/80 px-3 py-1.5 rounded-lg backdrop-blur-sm hover:bg-gray-700 text-gray-300 transition-colors">
                                    <Share2 className="h-5 w-5" />
                                    <span>Share</span>
                                </button>
                            </div>
                        </div>

                        {isOwner && (
                            <div className="flex space-x-3">
                                <Link to={`/edit-recipe/${id}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                    <Edit className="h-4 w-4" />
                                    <span>Edit</span>
                                </Link>
                                <button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Description & Ingredients */}
                    <div className="lg:col-span-1 space-y-10">
                        <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                                <ChefHat className="h-5 w-5 mr-2 text-primary" />
                                Description
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                                {recipe.description}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Ingredients</h3>
                            <ul className="space-y-4">
                                {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                                    <li key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-800/50 transition-colors">
                                        <div className="mt-1">
                                            <CheckCircle className="h-5 w-5 text-secondary" />
                                        </div>
                                        <div>
                                            <span className="font-bold text-white">{ingredient.quantity} {ingredient.unit}</span>
                                            <span className="text-gray-300 ml-2">{ingredient.name}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Instructions & Comments */}
                    <div className="lg:col-span-2 space-y-12">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">Instructions</h3>
                            <div className="space-y-8">
                                {recipe.steps && recipe.steps.map((step, index) => (
                                    <div key={index} className="flex gap-6">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                                                {index + 1}
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <p className="text-gray-300 text-lg leading-relaxed">{step}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2 flex items-center">
                                <MessageSquare className="h-6 w-6 mr-2" />
                                Comments ({comments.length})
                            </h3>

                            {/* Comment Form */}
                            <form onSubmit={handleComment} className="mb-8">
                                <div className="flex gap-4">
                                    <input
                                        type="text"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add a comment..."
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <button type="submit" className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center">
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Comments List */}
                            <div className="space-y-6">
                                {comments.map((comment) => (
                                    <div key={comment.id} className="bg-gray-800/30 p-4 rounded-xl border border-gray-700/50">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-white">{comment.username || "User"}</span>
                                            <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-gray-300">{comment.text}</p>
                                    </div>
                                ))}
                                {comments.length === 0 && (
                                    <p className="text-gray-500 text-center py-4">No comments yet. Be the first to share your thoughts!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default RecipeDetail;
