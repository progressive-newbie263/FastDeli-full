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

// func cập nhật lại số lượng sản phẩm ở giỏ hàng sau mỗi lần tăng/giảm thêm/bớt sản phẩm
export function updateCartQuantity(groupedCart: RestaurantGroup[]): void {
  const totalItems = groupedCart.reduce((total, group) =>
    total + group.items.reduce((sum, item) => sum + item.quantity, 0)
  , 0);

  localStorage.setItem('cartQuantity', totalItems.toString());
  window.dispatchEvent(new Event('cart-updated'));
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

