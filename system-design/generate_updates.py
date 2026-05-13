import re

sql_file = r'd:\\FastDeli\\project\\system-design\\30_restaurants_and_foods.sql'

with open(sql_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Generate UPDATE statements
update_statements = []

# Extract restaurants
rest_matches = re.finditer(r"INSERT INTO public\.restaurants \([^)]+\) VALUES \((\d+), [^,]+, '(.*?)',.*?'(http[^']+)'\)( ON CONFLICT DO NOTHING;)?", content)
for m in rest_matches:
    rest_id = m.group(1)
    name = m.group(2)
    img = m.group(3)
    update_statements.append(f"UPDATE public.restaurants SET image_url = '{img}' WHERE id = {rest_id};")

# Extract foods
food_matches = re.finditer(r"INSERT INTO public\.foods \([^)]+\) VALUES \((\d+), '(.*?)',.*?'(http[^']+)'\);", content)
for m in food_matches:
    rest_id = m.group(1)
    name = m.group(2)
    img = m.group(3)
    # Since food doesn't have an explicit ID in this insert, we update by restaurant_id and food_name
    update_statements.append(f"UPDATE public.foods SET image_url = '{img}' WHERE restaurant_id = {rest_id} AND food_name = '{name}';")

with open(r'd:\\FastDeli\\project\\system-design\\31_update_images.sql', 'w', encoding='utf-8') as f:
    f.write("-- Cập nhật ảnh cho nhà hàng và món ăn\n")
    f.write("\n".join(update_statements))

# Restore the original INSERTs without image_url
content = re.sub(
    r"(INSERT INTO public\.restaurants \([^)]+)(, image_url)(\) VALUES \()([^)]+)(, 'http[^']+')(\))",
    r"\1\3\4\6",
    content
)
content = re.sub(
    r"(INSERT INTO public\.foods \([^)]+)(, image_url)(\) VALUES \()([^)]+)(, 'http[^']+')(\))",
    r"\1\3\4\6",
    content
)

with open(sql_file, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done generating UPDATE statements")
