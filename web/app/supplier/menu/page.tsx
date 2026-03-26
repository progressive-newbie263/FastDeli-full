'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Food, FoodCategory, FoodNutrition } from '../types';
import { Plus, Edit, Trash2, Search, ToggleLeft, ToggleRight, Upload, Leaf, X, ChevronRight } from 'lucide-react';

export default function MenuPage() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (restaurant?.id) {
      loadMenuData();
    } else {
      setLoading(false);
    }
  }, [restaurant, authLoading]);

  // Khoá scroll body khi có modal mở
  useEffect(() => {
    if (showAddModal || editingFood) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showAddModal, editingFood]);

  const loadMenuData = async () => {
    if (!restaurant?.id) return;
    try {
      setLoading(true);
      const foodsResponse = await SupplierAPI.getMyFoods(restaurant.id, 1, 100);
      if (foodsResponse.success && foodsResponse.data) {
        setFoods(foodsResponse.data.foods || []);
      }
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
        setFoods(prev => prev.map(f =>
          f.food_id === foodId ? { ...f, is_available: !currentStatus } : f
        ));
      } else {
        alert(response.message || 'Không thể cập nhật trạng thái');
      }
    } catch {
      alert('Lỗi khi cập nhật trạng thái món ăn');
    }
  };

  const handleDeleteFood = async (foodId: number, foodName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa món "${foodName}"?`)) return;
    try {
      const response = await SupplierAPI.deleteFood(foodId);
      if (response.success) {
        setFoods(prev => prev.filter(f => f.food_id !== foodId));
        alert('Xóa món ăn thành công');
      } else {
        alert(response.message || 'Không thể xóa món ăn');
      }
    } catch {
      alert('Lỗi khi xóa món ăn');
    }
  };

  const formatCurrency = (price: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const filteredFoods = foods.filter(f =>
    f.food_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeModal = useCallback(() => {
    setShowAddModal(false);
    setEditingFood(null);
  }, []);

  return (
    <SupplierLayout title="Quản lý thực đơn" subtitle="Thêm, sửa, xóa món ăn">
      {/* Header actions */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm món ăn..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600" />
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
          {filteredFoods.map(food => (
            <div
              key={food.food_id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              <div className="relative h-48 bg-gray-100">
                {food.image_url ? (
                  <img src={food.image_url} alt={food.food_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-300">
                    <span className="text-5xl">🍽️</span>
                  </div>
                )}
                <button
                  onClick={() => handleToggleAvailability(food.food_id, food.is_available)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full text-white shadow transition-opacity hover:opacity-80 ${
                    food.is_available ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  title={food.is_available ? 'Đang bán' : 'Ngừng bán'}
                >
                  {food.is_available ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                </button>
              </div>

              <div className="p-4">
                <h3 className="text-base font-bold text-gray-900 mb-1 truncate">{food.food_name}</h3>
                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{food.description}</p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-orange-600">{formatCurrency(food.price)}</span>
                  <div className="flex items-center gap-2">
                    {food.category_name && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {food.category_name}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      food.is_available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {food.is_available ? 'Đang bán' : 'Ngừng bán'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingFood(food)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Edit size={14} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDeleteFood(food.food_id, food.food_name)}
                    className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {(showAddModal || editingFood) && (
        <FoodFormModal
          food={editingFood}
          categories={categories}
          restaurantId={restaurant?.id}
          onClose={closeModal}
          onSuccess={() => { closeModal(); loadMenuData(); }}
        />
      )}
    </SupplierLayout>
  );
}

// ─── Food Form Modal ────────────────────────────────────────────────────────

function FoodFormModal({
  food, categories, restaurantId, onClose, onSuccess,
}: {
  food: Food | null;
  categories: FoodCategory[];
  restaurantId?: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    food_name:    food?.food_name    || '',
    description:  food?.description  || '',
    price:        food?.price        || 0,
    image_url:    food?.image_url    || '',
    category_id:  food?.category_id  || undefined,
    is_available: food?.is_available ?? true,
  });
  const [submitting, setSubmitting]           = useState(false);
  const [uploading, setUploading]             = useState(false);
  const [showNutrition, setShowNutrition]     = useState(false);
  const [visible, setVisible]                 = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // mount animation
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    if (!food?.food_id) { alert('Vui lòng lưu món ăn trước khi upload ảnh'); return; }
    try {
      setUploading(true);
      const response = await SupplierAPI.uploadFoodImage(food.food_id, e.target.files[0]);
      const imageUrl = response.data?.url || (response as unknown as { url?: string }).url;

      if (response.success && imageUrl) {
        setFormData(p => ({ ...p, image_url: imageUrl }));
        alert('Upload ảnh thành công!');
      } else {
        alert(response.message || 'Upload ảnh thất bại');
      }
    } catch { alert('Lỗi khi upload ảnh'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) { alert('Không tìm thấy thông tin nhà hàng'); return; }
    try {
      setSubmitting(true);
      const submitData = { ...formData, category_id: formData.category_id ? Number(formData.category_id) : undefined };
      const response = food
        ? await SupplierAPI.updateFood(food.food_id, submitData)
        : await SupplierAPI.createFood(restaurantId, submitData);
      if (response.success) {
        alert(food ? 'Cập nhật thành công' : 'Thêm món thành công');
        onSuccess();
      } else {
        alert(response.message || 'Có lỗi xảy ra');
      }
    } catch { alert('Lỗi khi lưu món ăn'); }
    finally { setSubmitting(false); }
  };

  return (
    <>
      {/* Backdrop — blur thay vì đen kịt */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${
          visible
            ? 'backdrop-blur-sm bg-black/40'
            : 'backdrop-blur-none bg-black/0'
        }`}
        onClick={handleBackdropClick}
      >
        {/* Panel */}
        <div
          className={`bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-all duration-220 ${
            visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
          }`}
          style={{ transition: 'opacity 220ms ease, transform 220ms ease' }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {food ? 'Chỉnh sửa món ăn' : 'Thêm món mới'}
              </h2>
              {food && <p className="text-sm text-gray-400 mt-0.5">{food.food_name}</p>}
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Image upload (edit only) */}
            {food && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {formData.image_url
                    ? <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                    : <div className="flex items-center justify-center h-full text-gray-300 text-2xl">🍽️</div>
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Hình ảnh món ăn</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm transition-colors disabled:opacity-50"
                  >
                    <Upload size={15} />
                    {uploading ? 'Đang tải...' : 'Thay ảnh'}
                  </button>
                  <p className="text-xs text-gray-400 mt-1.5">Lưu trên Cloudinary</p>
                </div>
              </div>
            )}

            {/* Tên món */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên món ăn *</label>
              <input
                type="text" required
                value={formData.food_name}
                onChange={e => setFormData(p => ({ ...p, food_name: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                placeholder="Nhập tên món..."
              />
            </div>

            {/* Mô tả */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
                placeholder="Mô tả ngắn về món ăn..."
              />
            </div>

            {/* Giá + Danh mục */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá (VNĐ) *</label>
                <input
                  type="number" required min="0"
                  value={formData.price}
                  onChange={e => setFormData(p => ({ ...p, price: Number(e.target.value) }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                <select
                  value={formData.category_id || ''}
                  onChange={e => setFormData(p => ({ ...p, category_id: e.target.value ? Number(e.target.value) : undefined }))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trạng thái */}
            <label className="flex items-center gap-3 cursor-pointer select-none group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={e => setFormData(p => ({ ...p, is_available: e.target.checked }))}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${formData.is_available ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${formData.is_available ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {formData.is_available ? 'Đang bán' : 'Ngừng bán'}
              </span>
            </label>

            {/* Nutrition button — chỉ khi edit */}
            {food && (
              <button
                type="button"
                onClick={() => setShowNutrition(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-green-50 border border-green-200 text-green-700 rounded-xl hover:bg-green-100 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <Leaf size={18} className="text-green-600" />
                  <span className="text-sm font-medium">Quản lý thông tin dinh dưỡng</span>
                </div>
                <ChevronRight size={16} className="text-green-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Đang lưu...' : food ? 'Lưu thay đổi' : 'Thêm món'}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Nutrition modal — render ở root, không nest trong FoodFormModal */}
      {showNutrition && food && (
        <NutritionModal
          foodId={food.food_id}
          foodName={food.food_name}
          onClose={() => setShowNutrition(false)}
        />
      )}
    </>
  );
}

// ─── Cache ──────────────────────────────────────────────────────────────────

interface NutrientPer100g { calories: number; protein: number; fat: number; sugar: number; }
const nutritionCache = new Map<string, NutrientPer100g>();

async function fetchNutritionCached(queryName: string): Promise<NutrientPer100g | null> {
  const cacheKey = queryName.toLowerCase().trim();
  if (nutritionCache.has(cacheKey)) return nutritionCache.get(cacheKey)!;

  const response = await SupplierAPI.calculateNutritionFromName(queryName);
  if (response.success && response.data) {
    const raw = response.data;
    const protein = raw.protein || 0;
    const fat     = raw.fat     || 0;
    const sugar   = raw.sugar   || 0;
    let calories  = raw.calories || 0;
    if (calories === 0 && (protein > 0 || fat > 0)) {
      calories = Math.round(protein * 4 + fat * 9 + sugar * 4);
      console.warn(`! Atwater fallback for "${cacheKey}": ${calories} kcal`);
    }
    const data: NutrientPer100g = { calories, protein, fat, sugar };
    nutritionCache.set(cacheKey, data);
    return data;
  }
  return null;
}

// ─── Nutrition Modal ────────────────────────────────────────────────────────

function NutritionModal({ foodId, foodName, onClose }: {
  foodId: number; foodName: string; onClose: () => void;
}) {
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [visible, setVisible]         = useState(false);
  const [nutritionData, setNutritionData] = useState<Partial<FoodNutrition>>({
    serving_size: '', calories: undefined, protein: undefined, fat: undefined, sugar: undefined,
  });

  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
  useEffect(() => { loadNutritionData(); }, [foodId]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 220);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) handleClose();
  };

  const loadNutritionData = async () => {
    try {
      setLoading(true);
      const response = await SupplierAPI.getFoodNutrition(foodId);
      if (response.success && response.data) setNutritionData(response.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  // bộ chuyển ngữ sẽ bao gồm 1 vài món ăn phổ biến nào đó
  // quá khó để làm 1 bộ auto convert hoàn chỉnh
  const translateToEnglish = (name: string): string => {
    const dictionary: Record<string, string> = {
      'thịt bò': 'beef ground raw', 'bò': 'beef ground raw',
      'thịt heo': 'pork lean raw', 'thịt lợn': 'pork lean raw', 'heo': 'pork lean raw', 'lợn': 'pork lean raw',
      'thịt gà': 'chicken breast raw', 'gà': 'chicken breast raw', 'ức gà': 'chicken breast raw',
      'cánh gà': 'chicken wing raw', 'đùi gà': 'chicken thigh raw',
      'cá': 'fish raw', 'cá hồi': 'salmon raw', 'cá ngừ': 'tuna raw',
      'cá basa': 'pangasius raw', 'cá rô phi': 'tilapia raw',
      'tôm': 'shrimp raw', 'mực': 'squid raw',
      'quả trứng': 'egg whole raw', 'quả trứng gà': 'egg whole raw', 'quả trứng vịt': 'duck egg raw',
      'trứng': 'egg whole raw', 'trứng gà': 'egg whole raw', 'trứng vịt': 'duck egg raw',
      'sữa': 'milk whole', 'phô mai': 'cheese cheddar', 'bơ': 'butter unsalted', 'sữa chua': 'yogurt plain whole milk',
      'cơm': 'white rice cooked', 'gạo': 'white rice raw', 'mì': 'wheat noodles cooked',
      'bánh mì': 'white bread', 'bún': 'rice noodles cooked', 'phở': 'rice noodles cooked',
      'miến': 'glass noodles cooked', 'khoai tây': 'potato boiled', 'khoai lang': 'sweet potato cooked',
      'rau': 'mixed vegetables', 'cà chua': 'tomato raw', 'hành': 'onion raw', 'tỏi': 'garlic raw',
      'rau muống': 'water spinach', 'cải': 'cabbage raw', 'cà rốt': 'carrot raw',
      'cà tím': 'eggplant raw', 'bông cải': 'broccoli raw', 'ớt': 'chili pepper raw',
      'nấm': 'mushroom raw', 'giá đỗ': 'bean sprouts raw',
      'táo': 'apple raw', 'chuối': 'banana raw', 'cam': 'orange raw', 'xoài': 'mango raw', 'dưa hấu': 'watermelon raw',
      'dầu': 'vegetable oil', 'dầu ăn': 'vegetable oil', 'đường': 'white sugar',
      'muối': 'salt', 'nước mắm': 'fish sauce', 'tương': 'soy sauce',
      'thịt ba chỉ': 'pork belly raw', 'ba chỉ': 'pork belly raw',
      'đậu hũ': 'tofu raw', 'đậu phụ': 'tofu raw',
      'lạp xưởng': 'chinese sausage', 'chả lụa': 'pork sausage', 'xúc xích': 'sausage', 'vịt': 'duck raw', 'thịt vịt': 'duck raw',
    };
    return dictionary[name.toLowerCase().trim()] ?? name;
  };

  const PIECE_WEIGHTS_G: Record<string, number> = {
    'egg whole raw': 55, 'duck egg raw': 70,
    'chicken breast raw': 150, 'chicken thigh raw': 120, 'chicken wing raw': 90,
    'shrimp raw': 12, 'fish raw': 150, 'salmon raw': 150, 'tofu raw': 100,
  };

  const parseIngredients = (text: string) => {
    const RE = /^(\d+(?:[.,]\d+)?)\s*(g|gram|grams|kg|kilogram|ml|l)?\s+(.+)$/i;
    return text.split(',').map(s => s.trim()).filter(Boolean).flatMap(item => {
      const match = item.match(RE);
      if (!match) { console.warn(`! Cannot parse: "${item}"`); return []; }
      const [, rawQty, unit = '', rawName] = match;
      let quantity = parseFloat(rawQty.replace(',', '.'));
      const unitLower = unit.toLowerCase();
      if (unitLower === 'kg' || unitLower === 'kilogram') {
        quantity *= 1000;
      } else if (!unitLower || unitLower === 'g' || unitLower === 'gram' || unitLower === 'grams') {
        if (!unitLower && quantity < 20) {
          const usaName = translateToEnglish(rawName.trim());
          quantity *= (PIECE_WEIGHTS_G[usaName] ?? 50);
        }
      }
      const usaName = translateToEnglish(rawName.trim());
      return [{ quantity, unit: unitLower || 'g', name: rawName.trim(), usaName }];
    });
  };

  const handleAutoCalculate = async () => {
    const text = nutritionData.serving_size || '';
    if (!text.trim()) { alert('Vui lòng nhập thành phần món ăn'); return; }
    try {
      setCalculating(true);
      const ingredients = parseIngredients(text);
      if (!ingredients.length) {
        alert('! Không thể phân tích.\nFormat: "100g thịt bò" hoặc "2 trứng"');
        return;
      }
      let totalCal = 0, totalPro = 0, totalFat = 0, totalSug = 0, ok = 0;
      const failed: string[] = [];
      for (const ing of ingredients) {
        const data = await fetchNutritionCached(ing.usaName);
        if (data) {
          const r = ing.quantity / 100;
          totalCal += data.calories * r; totalPro += data.protein * r;
          totalFat += data.fat * r;      totalSug += data.sugar * r;
          ok++;
        } else {
          failed.push(`${ing.quantity}g ${ing.name}`);
        }
      }
      if (!ok) { alert('Không tìm thấy thông tin dinh dưỡng.'); return; }
      setNutritionData(p => ({
        ...p,
        calories: Math.round(totalCal),
        protein:  Math.round(totalPro * 10) / 10,
        fat:      Math.round(totalFat * 10) / 10,
        sugar:    Math.round(totalSug * 10) / 10,
      }));
      let msg = `Thành công ${ok}/${ingredients.length} thành phần\n\nKết quả:\n• Calories: ${Math.round(totalCal)} kcal\n• Protein: ${Math.round(totalPro*10)/10}g\n• Fat: ${Math.round(totalFat*10)/10}g\n• Sugar: ${Math.round(totalSug*10)/10}g`;
      if (failed.length) msg += `\n\n ! Không tìm thấy: ${failed.join(', ')}`;
      alert(msg);
    } catch { alert('Lỗi khi tính toán'); }
    finally { setCalculating(false); }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const r = await SupplierAPI.upsertFoodNutrition(foodId, nutritionData);
      if (r.success) { alert('Lưu thành công!'); handleClose(); }
      else alert(r.message || 'Có lỗi xảy ra');
    } catch { alert('Lỗi khi lưu'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirm('Xóa thông tin dinh dưỡng?')) return;
    try {
      const r = await SupplierAPI.deleteFoodNutrition(foodId);
      if (r.success) { alert('Đã xóa'); handleClose(); }
      else alert(r.message || 'Có lỗi xảy ra');
    } catch { alert('Lỗi khi xóa'); }
  };

  const updateField = (field: keyof FoodNutrition, value: string) =>
    setNutritionData(p => ({ ...p, [field]: value === '' ? undefined : parseFloat(value) }));

  return (
    // z-[60] để nằm trên FoodFormModal (z-50)
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-200 ${
        visible ? 'backdrop-blur-sm bg-black/50' : 'backdrop-blur-none bg-black/0'
      }`}
      onClick={handleBackdropClick}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto transition-all duration-220 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
        style={{ transition: 'opacity 220ms ease, transform 220ms ease' }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <div className="flex items-center gap-2">
              <Leaf size={18} className="text-green-600" />
              <h2 className="text-lg font-bold text-gray-900">Thông tin dinh dưỡng</h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5 ml-6">{foodName}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-green-500 mx-auto" />
            <p className="mt-4 text-sm text-gray-400">Đang tải...</p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Serving size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Thành phần món ăn</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nutritionData.serving_size || ''}
                  onChange={e => setNutritionData(p => ({ ...p, serving_size: e.target.value }))}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition"
                  placeholder="100g thịt bò, 2 trứng, 50g cơm"
                />
                <button
                  type="button"
                  onClick={handleAutoCalculate}
                  disabled={calculating}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 text-sm font-medium whitespace-nowrap transition-colors"
                >
                  {calculating ? '⏳ Đang tính...' : '✨ Tính tự động'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Format: "100g thịt bò" (gram) hoặc "2 trứng" (đếm)
              </p>
            </div>

            {/* 4 nutrient fields */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Thông tin chính (per serving)</h3>
              <div className="grid grid-cols-2 gap-3">
                {([
                  { key: 'calories', label: 'Calories', unit: 'kcal', color: 'orange' },
                  { key: 'protein',  label: 'Protein',  unit: 'g',    color: 'blue'   },
                  { key: 'fat',      label: 'Fat',      unit: 'g',    color: 'yellow' },
                  { key: 'sugar',    label: 'Sugar',    unit: 'g',    color: 'pink'   },
                ] as const).map(({ key, label, unit, color }) => (
                  <div key={key} className={`p-3 rounded-xl border ${
                    color === 'orange' ? 'border-orange-100 bg-orange-50' :
                    color === 'blue'   ? 'border-blue-100 bg-blue-50' :
                    color === 'yellow' ? 'border-yellow-100 bg-yellow-50' :
                                         'border-pink-100 bg-pink-50'
                  }`}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      {label} <span className="text-gray-400">({unit})</span>
                    </label>
                    <input
                      type="number" step="0.01" min="0"
                      value={(nutritionData as any)[key] || ''}
                      onChange={e => updateField(key as keyof FoodNutrition, e.target.value)}
                      className="w-full bg-transparent text-lg font-bold text-gray-900 focus:outline-none placeholder:text-gray-300"
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Đang lưu...' : 'Lưu thông tin'}
              </button>
              {nutritionData.nutrition_id && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors text-sm font-medium"
                >
                  Xóa
                </button>
              )}
              <button
                onClick={handleClose}
                className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}