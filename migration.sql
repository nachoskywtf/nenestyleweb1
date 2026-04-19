-- Insert complete catalog into Supabase
-- Products
INSERT INTO products (id, name, price, category_id, images, description, sizes, created_at) 
VALUES 
  (gen_random_uuid(), 'North Face Nuptse 700', 120000, '3812f933-0bcc-4e44-a46c-5665197c3e31', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'], 'Chaqueta North Face Nuptse 700', ARRAY[JSONB_BUILD_OBJECT('size', 'M', 'stock', 5), JSONB_BUILD_OBJECT('size', 'L', 'stock', 3)], NOW()),
  (gen_random_uuid(), 'Nike Air Max 90', 95000, 'ca6dce0a-d883-4aa9-a71b-5234223456c2', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'], 'Zapatillas Nike Air Max 90', ARRAY[JSONB_BUILD_OBJECT('size', '42', 'stock', 4), JSONB_BUILD_OBJECT('size', '43', 'stock', 2)], NOW())
ON CONFLICT DO NOTHING;

-- Categories (ensure they exist)
INSERT INTO categories (id, name, created_at) 
VALUES 
  ('3812f933-0bcc-4e44-a46c-5665197c3e31', 'Ropa Urbana', NOW()),
  ('ca6dce0a-d883-4aa9-a71b-5234223456c2', 'Zapatillas', NOW()),
  ('3', 'Perfumes', NOW())
ON CONFLICT DO NOTHING;
