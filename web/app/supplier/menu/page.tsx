'use client';

import React, { useEffect, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Food, FoodCategory } from '../types';
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight } from 'lucide-react';

export default function MenuPage() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  useEffect(() => {
    // Chờ auth loading xong trước
    if (authLoading) {
      return;
    }

    if (restaurant?.id) {
      loadMenuData();
    } else {
      // Restaurant chưa load hoặc không tồn tại
      setLoading(false);
    }
  }, [restaurant, authLoading]);

  const loadMenuData = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);

      // Load foods
      const foodsResponse = await SupplierAPI.getMyFoods(restaurant.id, 1, 100);
      if (foodsResponse.success && foodsResponse.data) {
        setFoods(foodsResponse.data.foods || []);
      }

      // Load categories
      const categoriesResponse = await SupplierAPI.getCategories();
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);
      }
    } catch (error) {
      console.error('Failed to load menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (foodId: number, currentStatus: boolean) => {
    try {
      const response = await SupplierAPI.toggleFoodAvailability(foodId, !currentStatus);
      if (response.success) {
        // Update local state immediately for better UX
        setFoods(prevFoods =>
          prevFoods.map(food =>
            food.food_id === foodId ? { ...food, is_available: !currentStatus } : food
          )
        );
      } else {
        alert(response.message || 'Không thể cập nhật trạng thái');
      }
    } catch (error) {
      alert('Lỗi khi cập nhật trạng thái món ăn');
    }
  };

  const handleDeleteFood = async (foodId: number, foodName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa món "${foodName}"?`)) return;

    try {
      const response = await SupplierAPI.deleteFood(foodId);
      if (response.success) {
        // Update local state immediately for better UX
        setFoods(prevFoods => prevFoods.filter(food => food.food_id !== foodId));
        alert('Xóa món ăn thành công');
      } else {
        alert(response.message || 'Không thể xóa món ăn');
      }
    } catch (error) {
      alert('Lỗi khi xóa món ăn');
    }
  };

  const formatCurrency = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const filteredFoods = foods.filter((food) =>
    food.food_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SupplierLayout title="Quản lý thực đơn" subtitle="Thêm, sửa, xóa món ăn">
      {/* Header actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Add button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={20} />
          Thêm món mới
        </button>
      </div>

      {/* Foods grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500 text-lg">Chưa có món ăn nào</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Thêm món đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFoods.map((food) => (
            <div
              key={food.food_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Food image */}
              <div className="relative h-48 bg-gray-200">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.food_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <span className="text-4xl">🍽️</span>
                  </div>
                )}

                {/* Availability toggle */}
                <button
                  onClick={() => handleToggleAvailability(food.food_id, food.is_available)}
                  className={`absolute top-2 right-2 p-2 rounded-full ${
                    food.is_available ? 'bg-green-500' : 'bg-gray-400'
                  } text-white shadow-lg hover:opacity-90 transition-opacity`}
                  title={food.is_available ? 'Đang bán' : 'Ngừng bán'}
                >
                  {food.is_available ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
              </div>

              {/* Food info */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{food.food_name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{food.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-xl font-bold text-orange-600">{formatCurrency(food.price)}</span>
                  {food.category_name && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {food.category_name}
                    </span>
                  )}
                </div>

                {/* Status badge */}
                <div className="mb-3">
                  {food.is_available ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Đang bán</span>
                  ) : (
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Ngừng bán</span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFood(food)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit size={16} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.food_id, food.food_name)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Food Modal */}
      {(showAddModal || editingFood) && (
        <FoodFormModal
          food={editingFood}
          categories={categories}
          restaurantId={restaurant?.id}
          onClose={() => {
            setShowAddModal(false);
            setEditingFood(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingFood(null);
            loadMenuData();
          }}
        />
      )}
    </SupplierLayout>
  );
}

// Food form modal component
function FoodFormModal({
  food,
  categories,
  restaurantId,
  onClose,
  onSuccess,
}: {
  food: Food | null;
  categories: FoodCategory[];
  restaurantId?: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    food_name: food?.food_name || '',
    description: food?.description || '',
    price: food?.price || 0,
    image_url: food?.image_url || '',
    category_id: food?.category_id || undefined,
    is_available: food?.is_available ?? true,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!restaurantId) {
      alert('Không tìm thấy thông tin nhà hàng');
      return;
    }

    try {
      setSubmitting(true);

      // Prepare data với đúng type
      const submitData = {
        ...formData,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
      };

      const response = food
        ? await SupplierAPI.updateFood(food.food_id, submitData)
        : await SupplierAPI.createFood(restaurantId, submitData);

      if (response.success) {
        alert(food ? 'Cập nhật món ăn thành công' : 'Thêm món ăn thành công');
        onSuccess(); // This will trigger loadMenuData() in parent
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      alert('Lỗi khi lưu món ăn');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{food ? 'Sửa món ăn' : 'Thêm món mới'}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên món ăn *</label>
            <input
              type="text"
              required
              value={formData.food_name}
              onChange={(e) => setFormData({ ...formData, food_name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={formData.category_id || ''}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL hình ảnh</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
              className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
            />
            <label htmlFor="is_available" className="text-sm text-gray-700">
              Món ăn đang bán
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : food ? 'Cập nhật' : 'Thêm món'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
