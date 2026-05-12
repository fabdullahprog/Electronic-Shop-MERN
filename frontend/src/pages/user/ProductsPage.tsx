import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiSearch } from 'react-icons/fi';
import ProductCard from '../../components/product/ProductCard';
import { Product, Category, ProductFilters } from '../../types';
import API from '../../utils/api';
import './ProductsPage.css';

const ProductsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: '', maxPrice: '',
    sort: searchParams.get('sort') || 'newest',
    page: 1,
    featured: searchParams.get('featured') || '',
    trending: searchParams.get('trending') || '',
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, String(v)); });
      params.set('limit', '12');
      const { data } = await API.get(`/products?${params}`);
      setProducts(data.products);
      setTotal(data.total);
      setPages(data.pages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    API.get('/categories').then(({ data }) => setCategories(data.categories)).catch(() => {});
    API.get('/products/brands').then(({ data }) => setBrands(data.brands)).catch(() => {});
  }, []);

  const updateFilter = (key: keyof ProductFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => setFilters({ keyword: '', category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest', page: 1, featured: '', trending: '' });

  return (
    <div className="products-page">
      <div className="container">
        <div className="products-header">
          <div>
            <h1 className="page-title">{filters.keyword ? `Search: "${filters.keyword}"` : 'All Products'}</h1>
            <p className="text-muted">{total} products found</p>
          </div>
          <div className="products-controls">
            <button className="filter-toggle-btn" onClick={() => setFilterOpen(!filterOpen)}><FiFilter /> Filters</button>
            <select className="sort-select" value={filters.sort} onChange={e => updateFilter('sort', e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="products-layout">
          {/* Filter Panel */}
          <div className={`filter-panel${filterOpen ? ' open' : ''}`}>
            <div className="filter-header"><h3>Filters</h3><button onClick={clearFilters} className="clear-btn">Clear All</button></div>

            <div className="filter-section">
              <h4>Search</h4>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-control" placeholder="Search..." value={filters.keyword} onChange={e => updateFilter('keyword', e.target.value)} style={{ padding: '8px 12px', fontSize: 14 }} />
              </div>
            </div>

            <div className="filter-section">
              <h4>Category</h4>
              <div className="filter-options">
                <label className={`filter-option${!filters.category ? ' active' : ''}`}>
                  <input type="radio" checked={!filters.category} onChange={() => updateFilter('category', '')} /> All Categories
                </label>
                {categories.map(cat => (
                  <label key={cat._id} className={`filter-option${filters.category === cat._id ? ' active' : ''}`}>
                    <input type="radio" checked={filters.category === cat._id} onChange={() => updateFilter('category', cat._id)} /> {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {brands.length > 0 && (
              <div className="filter-section">
                <h4>Brand</h4>
                <div className="filter-options">
                  <label className={`filter-option${!filters.brand ? ' active' : ''}`}>
                    <input type="radio" checked={!filters.brand} onChange={() => updateFilter('brand', '')} /> All Brands
                  </label>
                  {brands.map(b => (
                    <label key={b} className={`filter-option${filters.brand === b ? ' active' : ''}`}>
                      <input type="radio" checked={filters.brand === b} onChange={() => updateFilter('brand', b)} /> {b}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-range">
                <input className="form-control" type="number" placeholder="Min BDT" value={filters.minPrice} onChange={e => updateFilter('minPrice', e.target.value)} />
                <span>—</span>
                <input className="form-control" type="number" placeholder="Max BDT" value={filters.maxPrice} onChange={e => updateFilter('maxPrice', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="products-main">
            {loading ? (
              <div className="page-loader"><div className="spinner" /></div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 64 }}></div>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
                <button className="btn btn-primary mt-2" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-3">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
                {pages > 1 && (
                  <div className="pagination">
                    <button disabled={filters.page! <= 1} onClick={() => updateFilter('page', filters.page! - 1)}>‹</button>
                    {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                      <button key={p} className={filters.page === p ? 'active' : ''} onClick={() => updateFilter('page', p)}>{p}</button>
                    ))}
                    <button disabled={filters.page! >= pages} onClick={() => updateFilter('page', filters.page! + 1)}>›</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
