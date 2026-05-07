CREATE TABLE public.product_color_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  color text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, color)
);

ALTER TABLE public.product_color_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "color images public read" ON public.product_color_images
  FOR SELECT USING (true);

CREATE POLICY "color images admin all" ON public.product_color_images
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM products p WHERE p.id = product_color_images.product_id AND has_store_role(auth.uid(), p.store_id, 'admin'::app_role)))
  WITH CHECK (EXISTS (SELECT 1 FROM products p WHERE p.id = product_color_images.product_id AND has_store_role(auth.uid(), p.store_id, 'admin'::app_role)));

CREATE INDEX idx_product_color_images_product ON public.product_color_images(product_id);