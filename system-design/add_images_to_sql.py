import re

sql_file = r'd:\\FastDeli\\project\\system-design\\30_restaurants_and_foods.sql'

with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

restaurant_images = {
    'Gà': 'https://images.unsplash.com/photo-1569058242253-11b3323086eb?w=500&q=80',
    'Hải Sản': 'https://images.unsplash.com/photo-1615141982883-c7da0e69f108?w=500&q=80',
    'Phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80',
    'Sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    'Cơm Tấm': 'https://images.unsplash.com/photo-1626804475297-4160ebae5252?w=500&q=80',
    'Chay': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80',
    'Bún Bò': 'https://images.unsplash.com/photo-1594991590483-360e227fc64a?w=500&q=80',
    'Pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&q=80',
    'Bún': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&q=80',
    'Cháo': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80',
    'Cơm': 'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=500&q=80',
    'Ốc': 'https://images.unsplash.com/photo-1627993074095-2cc02d0ece29?w=500&q=80'
}
default_restaurant = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80'

food_images = {
    'Gà': 'https://images.unsplash.com/photo-1626082927389-6cd09fccfaa1?w=500&q=80',
    'Bạch tuộc': 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=500&q=80',
    'Cua': 'https://images.unsplash.com/photo-1565557623262-b51f08bc7958?w=500&q=80',
    'Hàu': 'https://images.unsplash.com/photo-1624021319080-60b6ae205a2e?w=500&q=80',
    'Tôm': 'https://images.unsplash.com/photo-1559742811-1a067a99f1fa?w=500&q=80',
    'Mực': 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=500&q=80',
    'Phở': 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&q=80',
    'Sushi': 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=500&q=80',
    'Sashimi': 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=500&q=80',
    'Maki': 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=500&q=80',
    'Cơm': 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80',
    'Miến': 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500&q=80',
    'Lẩu': 'https://images.unsplash.com/photo-1549488344-cbb6c34cf5e2?w=500&q=80',
    'Gỏi': 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=500&q=80',
    'Bún': 'https://images.unsplash.com/photo-1594991590483-360e227fc64a?w=500&q=80',
    'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&q=80',
    'Trà sữa': 'https://images.unsplash.com/photo-1558160074-4d7d8bdf4256?w=500&q=80',
    'Cháo': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=500&q=80'
}
default_food = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80'

def get_image(name, image_dict, default):
    for key, url in image_dict.items():
        if key.lower() in name.lower():
            return url
    return default

def repl_restaurant(m):
    # m.group(1): INSERT INTO public.restaurants (id, owner_id, name, email, phone, address, description, status, verification_status
    # m.group(2): 201, 201, 'Góc ẩm thực Gà Rán Hương Thảo', 'restaurant1@gmail.com', '0988888881', 'Số 191 Nguyễn Trãi, Ba Đình, Hà Nội', 'Một quán ăn tuyệt vời với hương vị vô cùng đặc trưng.', 'active', 'approved'
    # We parse the name by splitting by comma, wait, simpler: find the name which is the third param
    # It's better to just extract the row directly.
    pass

import csv
import io

def repl_restaurant_row(m):
    insert = m.group(1)
    values_str = m.group(2)
    suffix = m.group(3)
    
    # parse values_str using split on ", " but name can have commas, though in this dataset it likely doesn't
    # let's just cheat and do regex for name
    name_match = re.search(r"\d+,\s*\d+,\s*'(.*?)'", values_str)
    name = name_match.group(1) if name_match else ""
    
    img = get_image(name, restaurant_images, default_restaurant)
    
    new_insert = insert.replace(")", ", image_url)")
    new_values = values_str + f", '{img}'"
    
    return f"{new_insert} VALUES ({new_values}){suffix}"

def repl_food_row(m):
    insert = m.group(1)
    values_str = m.group(2)
    suffix = m.group(3)
    
    name_match = re.search(r"\d+,\s*'(.*?)'", values_str)
    name = name_match.group(1) if name_match else ""
    
    img = get_image(name, food_images, default_food)
    
    new_insert = insert.replace(")", ", image_url)")
    new_values = values_str + f", '{img}'"
    
    return f"{new_insert} VALUES ({new_values}){suffix}"


content = re.sub(
    r"(INSERT INTO public\.restaurants \([^)]+\)) VALUES \((.*?)\)( ON CONFLICT DO NOTHING;)",
    repl_restaurant_row,
    content
)

content = re.sub(
    r"(INSERT INTO public\.foods \([^)]+\)) VALUES \((.*?)\)(;)",
    repl_food_row,
    content
)

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write(content)

print('Done')
