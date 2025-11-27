import { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, Upload, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';

const EditRecipe = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            title: '',
            description: '',
            ingredients: [{ name: '', quantity: '', unit: '' }],
            steps: [{ value: '' }],
            prepTimeMinutes: 0,
            cookTimeMinutes: 0,
            imageUrl: '',
            tags: ''
        }
    });

    const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } = useFieldArray({
        control,
        name: "ingredients"
    });

    const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({
        control,
        name: "steps"
    });

    const imageUrlValue = useWatch({
        control,
        name: "imageUrl",
        defaultValue: ""
    });

    useEffect(() => {
        const fetchRecipe = async () => {
            try {
                const response = await api.get(`/recipe/${id}`);
                const recipe = response.data;

                // Check ownership
                if (user && recipe.userId !== user.id) {
                    alert("You are not authorized to edit this recipe");
                    navigate('/');
                    return;
                }

                // Ensure steps is an array of strings, sometimes backend might return null
                if (!recipe.steps) recipe.steps = [''];
                if (!recipe.ingredients) recipe.ingredients = [{ name: '', quantity: '', unit: '' }];

                const formData = {
                    ...recipe,
                    steps: recipe.steps.map(step => ({ value: step })),
                    tags: recipe.tags ? recipe.tags.join(', ') : ''
                };

                reset(formData);
            } catch (error) {
                console.error("Error fetching recipe", error);
                alert("Failed to load recipe");
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchRecipe();
        }
    }, [id, user, navigate, reset]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/image/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setValue('imageUrl', response.data.url);
        } catch (error) {
            console.error("Error uploading image", error);
            alert("Failed to upload image");
        }
    };

    const onSubmit = async (data) => {
        try {
            // Transform steps back to array of strings
            const formattedData = {
                ...data,
                steps: data.steps.map(step => step.value),
                userId: user.id,
                ingredients: data.ingredients.map(ing => ({
                    ...ing,
                    quantity: parseFloat(ing.quantity)
                })),
                tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
            };

            await api.put(`/recipe/update/${id}`, formattedData);
            navigate(`/recipe/${id}`);
        } catch (error) {
            console.error("Error updating recipe", error);
            alert("Failed to update recipe");
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-dark flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-dark text-gray-900 dark:text-light transition-colors duration-200">
            <Navbar />
            <div className="py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center mb-8">
                        <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="h-6 w-6" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Recipe</h1>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {/* Basic Info */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Basic Information</h2>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Recipe Title</label>
                                    <input
                                        {...register('title', { required: 'Title is required' })}
                                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g., Spicy Miso Ramen"
                                    />
                                    {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Description</label>
                                    <textarea
                                        {...register('description', { required: 'Description is required' })}
                                        rows={4}
                                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="Describe your recipe..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Tags</label>
                                    <input
                                        {...register('tags')}
                                        className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        placeholder="e.g., vegan, healthy, dessert (comma separated)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Recipe Image</label>
                                    <div className="flex gap-2 items-center">
                                        <div className="relative flex-grow">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="block w-full text-sm text-gray-500 dark:text-gray-400
                                                    file:mr-4 file:py-2 file:px-4
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-primary file:text-white
                                                    hover:file:bg-orange-600
                                                    cursor-pointer
                                                "
                                            />
                                        </div>
                                    </div>
                                    {/* Image Preview */}
                                    <div className="mt-4">
                                        {imageUrlValue ? (
                                            <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                                                <img
                                                    src={imageUrlValue}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="absolute inset-0 hidden flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-500">
                                                    <Upload className="h-12 w-12 mb-2 opacity-50" />
                                                    <span className="text-sm">Image not available</span>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Prep Time (mins)</label>
                                        <input
                                            type="number"
                                            {...register('prepTimeMinutes', { min: 0 })}
                                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Cook Time (mins)</label>
                                        <input
                                            type="number"
                                            {...register('cookTimeMinutes', { min: 0 })}
                                            className="block w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Ingredients */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Ingredients</h2>
                                <button
                                    type="button"
                                    onClick={() => appendIngredient({ name: '', quantity: '', unit: '' })}
                                    className="text-sm text-primary hover:text-orange-600 dark:hover:text-orange-400 font-medium flex items-center"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                                </button>
                            </div>

                            <div className="space-y-3">
                                {ingredientFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-start">
                                        <div className="flex-grow grid grid-cols-12 gap-3">
                                            <div className="col-span-6">
                                                <input
                                                    {...register(`ingredients.${index}.name`, { required: true })}
                                                    placeholder="Ingredient name"
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    type="number"
                                                    step="any"
                                                    {...register(`ingredients.${index}.quantity`, { required: true })}
                                                    placeholder="Qty"
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <input
                                                    {...register(`ingredients.${index}.unit`, { required: true })}
                                                    placeholder="Unit"
                                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeIngredient(index)}
                                            className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Instructions</h2>
                                <button
                                    type="button"
                                    onClick={() => appendStep({ value: '' })}
                                    className="text-sm text-primary hover:text-orange-600 dark:hover:text-orange-400 font-medium flex items-center"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Step
                                </button>
                            </div>

                            <div className="space-y-3">
                                {stepFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-start">
                                        <div className="flex-shrink-0 mt-2">
                                            <span className="h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-700 dark:text-white font-bold">
                                                {index + 1}
                                            </span>
                                        </div>
                                        <div className="flex-grow">
                                            <textarea
                                                {...register(`steps.${index}.value`, { required: true })}
                                                rows={2}
                                                placeholder={`Step ${index + 1} instructions...`}
                                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeStep(index)}
                                            className="p-2 text-gray-500 hover:text-red-500 transition-colors mt-1"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                className="bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center space-x-2 transition-all transform hover:scale-105"
                            >
                                <Save className="h-5 w-5" />
                                <span>Update Recipe</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditRecipe;
