import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const ProductToStore = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        // Fetch product to get sellerId
        const res = await fetch(`${API_URL}/products/${productId}`);
        if (!res.ok) return navigate('/', { replace: true });
        const data = await res.json();
        const sellerId = data.product?.sellerId;
        if (!sellerId) return navigate(`/view/${productId}`, { replace: true });

        // Fetch seller to get slug
        const sellerRes = await fetch(`${API_URL}/sellers/${sellerId}`);
        if (!sellerRes.ok) return navigate(`/view/${productId}`, { replace: true });
        const sellerData = await sellerRes.json();
        const slug = sellerData.seller?.storeSlug || sellerData.seller?.storeName;
        if (!slug) return navigate(`/view/${productId}`, { replace: true });

        // Navigate to slug-based view
        navigate(`/${slug}/view/${productId}`, { replace: true });
      } catch (err) {
        console.error('Product redirect error', err);
        navigate(`/view/${productId}`, { replace: true });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [productId, navigate]);

  if (loading) return <div style={{padding:20}}>Redirecting…</div>;
  return null;
};

export default ProductToStore;
