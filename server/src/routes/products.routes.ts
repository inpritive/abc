import express, { Request, Response } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { authenticate, requireSeller, AuthRequest } from '../middleware/auth';
import { emitStockUpdate, emitProductUpdated } from '../socket/socket';

const router = express.Router();

// GET /api/products/categories
router.get('/categories', async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/brands
router.get('/brands', async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await Product.distinct('brand');
    res.json({ success: true, brands: brands.filter(Boolean) });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, brand, search, inStockOnly, minPrice, maxPrice, sortBy } = req.query;

    let filter: any = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (brand && brand !== 'all') {
      filter.brand = brand;
    }
    if (inStockOnly === 'true') {
      filter.stockQuantity = { $gt: 0 };
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (search) {
      filter.$or = [
        { name: { $regex: String(search), $options: 'i' } },
        { description: { $regex: String(search), $options: 'i' } },
        { brand: { $regex: String(search), $options: 'i' } },
      ];
    }

    let sort: any = { createdAt: -1 };
    if (sortBy === 'price-asc') sort = { price: 1 };
    else if (sortBy === 'price-desc') sort = { price: -1 };
    else if (sortBy === 'name') sort = { name: 1 };
    else if (sortBy === 'stock') sort = { stockQuantity: 1 };

    const products = await Product.find(filter).sort(sort);
    res.json({ success: true, count: products.length, products });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:idOrSlug
router.get('/:idOrSlug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { idOrSlug } = req.params;
    let product;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(idOrSlug);
    } else {
      product = await Product.findOne({ slug: idOrSlug });
    }

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products (Seller only)
router.post('/', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      category,
      brand,
      price,
      costPrice,
      stockQuantity,
      unit,
      image,
      description,
      lowStockThreshold,
    } = req.body;

    const newProduct = await Product.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category,
      brand,
      price: Number(price),
      costPrice: Number(costPrice || price * 0.75),
      stockQuantity: Number(stockQuantity || 0),
      unit: unit || 'piece',
      image: image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80',
      description: description || '',
      lowStockThreshold: Number(lowStockThreshold || 5),
    });

    emitProductUpdated(newProduct);
    res.status(201).json({ success: true, product: newProduct });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id (Seller only)
router.put('/:id', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    emitProductUpdated(updatedProduct);
    emitStockUpdate(updatedProduct._id.toString(), updatedProduct.stockQuantity);
    res.json({ success: true, product: updatedProduct });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id (Seller only)
router.delete('/:id', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);
    emitProductUpdated({ _id: req.params.id, deleted: true });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products/bulk-stock (Seller quick stock update)
router.post('/bulk-stock', authenticate, requireSeller, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, changeAmount, operation } = req.body; // operation: 'add' | 'subtract' | 'set'
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    let newStock = product.stockQuantity;
    if (operation === 'add') {
      newStock += Number(changeAmount);
    } else if (operation === 'subtract') {
      newStock = Math.max(0, newStock - Number(changeAmount));
    } else if (operation === 'set') {
      newStock = Math.max(0, Number(changeAmount));
    }

    product.stockQuantity = newStock;
    await product.save();

    emitStockUpdate(product._id.toString(), product.stockQuantity);
    emitProductUpdated(product);

    res.json({ success: true, product, message: 'Stock updated successfully' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
