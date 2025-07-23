export interface StoredCartItem {
  food_id: number;
  quantity: number;
}

export interface CartItem {
  restaurant_id: string;
  food_id: number;
  food_name: string;
  price: number;
  image_url: string | null;
  description?: string;
  quantity: number;
}

export interface RestaurantGroup {
  restaurant_id: string;
  restaurant_name: string;
  restaurant_image?: string;
  items: CartItem[];
}

export interface FullCart {
  [restaurantId: string]: StoredCartItem[];
}


//  Tính tổng tiền của các món đã đặt trong 1 nhà hàng.  
export function getGroupTotal(group: RestaurantGroup): number {
  return group.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

// Tính tổng tiền toàn bộ giỏ hàng (gồm tất cả nhà hàng) 
export function getTotalCart(groupedCart: RestaurantGroup[]): number {
  return groupedCart.reduce((sum, group) => sum + getGroupTotal(group), 0);
}

// Cập nhật localStorage từ mảng groupedCart 
export function updateLocalStorage(groupedCart: RestaurantGroup[]): void {
  const fullCart: FullCart = {};
  groupedCart.forEach(group => {
    fullCart[group.restaurant_id] = group.items.map(({ food_id, quantity }) => ({
      food_id,
      quantity
    }));
  });

  localStorage.setItem('cart', JSON.stringify(fullCart));
}

// ✅ CẢI THIỆN: func cập nhật lại số lượng sản phẩm ở giỏ hàng với error handling tốt hơn
export function updateCartQuantity(groupedCart: RestaurantGroup[]): void {
  try {
    // Kiểm tra nếu cart rỗng hoặc không hợp lệ
    if (!groupedCart || groupedCart.length === 0) {
      //localStorage.setItem('cartQuantity', '0');
      window.dispatchEvent(new Event('cart-updated'));
      return;
    }

    // Tính tổng với validation
    const totalItems = groupedCart.reduce((total, group) => {
      if (!group || !group.items || !Array.isArray(group.items)) {
        return total;
      }
      
      return total + group.items.reduce((sum, item) => {
        if (!item || typeof item.quantity !== 'number' || item.quantity < 0) {
          return sum;
        }
        return sum + item.quantity;
      }, 0);
    }, 0);

    // Đảm bảo số lượng là số hợp lệ
    const safeQuantity = isNaN(totalItems) || totalItems < 0 ? 0 : Math.floor(totalItems);

    //localStorage.setItem('cartQuantity', safeQuantity.toString());
    window.dispatchEvent(new Event('cart-updated'));
  } catch (error) {
    console.error('Error updating cart quantity:', error);
    // Fallback: set về 0 nếu có lỗi
    //localStorage.setItem('cartQuantity', '0');
    window.dispatchEvent(new Event('cart-updated'));
  }
}



export function handleIncrease(
  groupedCart: RestaurantGroup[],
  setGroupedCart: React.Dispatch<React.SetStateAction<RestaurantGroup[]>>,
  selectedRestaurant: RestaurantGroup | null,
  setSelectedRestaurant: React.Dispatch<React.SetStateAction<RestaurantGroup | null>>,
  food_id: number,
  restaurant_id: string
): void {
  const newGroupedCart = groupedCart.map(group => {
    if (group.restaurant_id !== restaurant_id) return group;

    const updatedItems = group.items.map(item =>
      item.food_id === food_id ? { ...item, quantity: item.quantity + 1 } : item
    );

    return { ...group, items: updatedItems };
  });

  setGroupedCart(newGroupedCart);
  updateLocalStorage(newGroupedCart);
  updateCartQuantity(newGroupedCart);

  if (selectedRestaurant && selectedRestaurant.restaurant_id === restaurant_id) {
    const newSelected: RestaurantGroup = {
      ...selectedRestaurant,
      items: selectedRestaurant.items.map(item =>
        item.food_id === food_id ? { ...item, quantity: item.quantity + 1 } : item
      )
    };
    setSelectedRestaurant(newSelected);
  }
}


export function handleDecrease(
  groupedCart: RestaurantGroup[],
  setGroupedCart: React.Dispatch<React.SetStateAction<RestaurantGroup[]>>,
  selectedRestaurant: RestaurantGroup | null,
  setSelectedRestaurant: React.Dispatch<React.SetStateAction<RestaurantGroup | null>>,
  food_id: number,
  restaurant_id: string
): void {
  let newGroupedCart = groupedCart.map(group => {
    if (group.restaurant_id !== restaurant_id) return group;

    const updatedItems = group.items.map(item =>
      item.food_id === food_id ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0);

    return { ...group, items: updatedItems };
  }).filter(group => group.items.length > 0);

  setGroupedCart(newGroupedCart);
  updateLocalStorage(newGroupedCart);
  updateCartQuantity(newGroupedCart);

  if (selectedRestaurant && selectedRestaurant.restaurant_id === restaurant_id) {
    const updatedItems = selectedRestaurant.items.map(item =>
      item.food_id === food_id ? { ...item, quantity: item.quantity - 1 } : item
    ).filter(item => item.quantity > 0);

    if (updatedItems.length === 0) {
      setSelectedRestaurant(null);
    } else {
      setSelectedRestaurant({ ...selectedRestaurant, items: updatedItems });
    }
  }
}