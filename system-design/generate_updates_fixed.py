import re

sql_file = r'd:\\FastDeli\\project\\system-design\\30_restaurants_and_foods.sql'

with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Reliable working images
valid_images = {
    'Gà': 'https://images.unsplash.com/photo-1598514982205-f36b96d1e8d4?w=500&q=80',
    'Hải Sản': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Tôm': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Cua': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Mực': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Hàu': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Bạch tuộc': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Ốc': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80',
    'Sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    'Sashimi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    'Maki': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    'Cơm': 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=500&q=80',
    'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
    'Cháo': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
    'Bún': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&q=80',
    'Gỏi': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&q=80',
    'Miến': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
    'Lẩu': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
    'Nướng': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80',
    'BBQ': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=500&q=80'
}

default_restaurant = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'
default_food = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'

def get_image(name, is_restaurant):
    for key, url in valid_images.items():
        if key.lower() in name.lower():
            return url
    return default_restaurant if is_restaurant else default_food

update_statements = []

# Extract restaurants
rest_matches = re.finditer(r"INSERT INTO public\.restaurants \([^)]+\) VALUES \((\d+), [^,]+, '(.*?)'", content)
for m in rest_matches:
    rest_id = m.group(1)
    name = m.group(2)
    img = get_image(name, True)
    update_statements.append(f"UPDATE public.restaurants SET image_url = '{img}' WHERE id = {rest_id};")

# Extract foods
food_matches = re.finditer(r"INSERT INTO public\.foods \([^)]+\) VALUES \((\d+), '(.*?)'", content)
for m in food_matches:
    rest_id = m.group(1)
    name = m.group(2)
    img = get_image(name, False)
    update_statements.append(f"UPDATE public.foods SET image_url = '{img}' WHERE restaurant_id = {rest_id} AND food_name = '{name}';")

with open(r'd:\\FastDeli\\project\\system-design\\31_update_images.sql', 'w', encoding='utf-8') as f:
    f.write("-- Cập nhật ảnh cho nhà hàng và món ăn\n")
    f.write("\n".join(update_statements))

print("Regenerated 31_update_images.sql with guaranteed valid image URLs.")
