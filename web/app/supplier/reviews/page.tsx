'use client';

import React, { useEffect, useState } from 'react';
import SupplierLayout from '../components/SupplierLayout';
import { useSupplierAuth } from '../contexts/SupplierAuthContext';
import SupplierAPI from '../lib/api';
import type { Review } from '../types';
import { Star, StarHalf, MessageSquare, User, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function ReviewsPage() {
  const { restaurant, isLoading: authLoading } = useSupplierAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 
      5: 0, 
      4: 0, 
      3: 0, 
      2: 0, 
      1: 0 
    }
  });
  const [filter, setFilter] = useState<'all' | 1 | 2 | 3 | 4 | 5>('all');

  useEffect(() => {
    if (authLoading) return;
    if (restaurant?.id) {
      loadReviews();
    }
  }, [restaurant, authLoading]);

  const loadReviews = async () => {
    if (!restaurant?.id) return;

    try {
      setLoading(true);
      const response = await SupplierAPI.getReviews(restaurant.id);

      if (response.success && response.data) {
        const reviewsData = response.data.reviews || [];
        setReviews(reviewsData);

        // Calculate statistics
        const total = reviewsData.length;
        const sum = reviewsData.reduce((acc: number, r: Review) => acc + r.rating, 0);
        const avg = total > 0 ? sum / total : 0;

        // Calculate distribution
        const dist = { 
          5: 0, 
          4: 0, 
          3: 0, 
          2: 0, 
          1: 0 
        };
        
        reviewsData.forEach((r: Review) => {
          dist[r.rating as keyof typeof dist]++;
        });

        setStats({
          averageRating: avg,
          totalReviews: total,
          distribution: dist,
        });
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} size={16} fill="#F59E0B" color="#F59E0B" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" size={16} fill="#F59E0B" color="#F59E0B" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} color="#D1D5DB" />);
    }

    return <div className="flex gap-1">{stars}</div>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const filteredReviews = filter === 'all' 
    ? reviews 
    : reviews.filter(r => r.rating === filter);

  if (loading) {
    return (
      <SupplierLayout title="Đánh giá từ khách hàng" subtitle="Xem các đánh giá và phản hồi">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </SupplierLayout>
    );
  }

  return (
    <SupplierLayout title="Đánh giá từ khách hàng" subtitle="Xem các đánh giá và phản hồi">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Overall rating */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan</h2>
            
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-orange-600 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="flex justify-center mb-2">
                {renderStars(stats.averageRating)}
              </div>
              <p className="text-sm text-gray-600">{stats.totalReviews} đánh giá</p>
            </div>

            {/* Rating distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.distribution[rating as keyof typeof stats.distribution];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                return (
                  <button
                    key={rating}
                    onClick={() => setFilter(filter === rating ? 'all' : (rating as 1 | 2 | 3 | 4 | 5))}
                    className={`w-full flex items-center gap-2 text-sm hover:bg-gray-50 p-2 rounded transition-colors ${
                      filter === rating ? 'bg-orange-50' : ''
                    }`}
                  >
                    <span className="font-medium w-12 text-gray-700">{rating} sao</span>
                    <div className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    
                    <span className="text-gray-700 w-8 text-right">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Bộ lọc</h2>
            <button
              onClick={() => setFilter('all')}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả đánh giá ({stats.totalReviews})
            </button>
          </div>
        </div>

        {/* Reviews list */}
        <div className="lg:col-span-2 space-y-4">
          {filteredReviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
              <p className="text-gray-600">
                {filter === 'all'
                  ? 'Nhà hàng chưa nhận được đánh giá từ khách hàng.'
                  : `Không có đánh giá ${filter} sao.`}
              </p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <div
                key={review.review_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Review header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      {review.customer_avatar ? (
                        <img
                          src={review.customer_avatar}
                          alt={review.customer_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="text-orange-600" size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{review.customer_name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} />
                        {formatDate(review.created_at)}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {renderStars(review.rating)}
                    {/* <span className="text-sm font-medium text-gray-700">{review.rating}/5</span> */}
                  </div>
                </div>

                {/* Review comment */}
                {review.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                )}

                {/* Food reviewed (if applicable) */}
                {review.food_name && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Món ăn: <span className="font-medium text-gray-900">{review.food_name}</span>
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </SupplierLayout>
  );
}
