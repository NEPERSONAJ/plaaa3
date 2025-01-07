/*
  # Update products table schema

  1. Changes
    - Add images array field to products table
    - Rename image_url to images
    - Migrate existing data
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'images'
  ) THEN
    -- Add new column
    ALTER TABLE products ADD COLUMN images text[] DEFAULT '{}';
    
    -- Migrate existing data
    UPDATE products 
    SET images = ARRAY[image_url]
    WHERE image_url IS NOT NULL;
    
    -- Drop old column
    ALTER TABLE products DROP COLUMN IF EXISTS image_url;
  END IF;
END $$;