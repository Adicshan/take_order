import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const SellerToStore = ({ target }) => {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch(`${API_URL}/sellers/${sellerId}`);
        if (!res.ok) return navigate('/', { replace: true });
        const data = await res.json();
        const slug = data.seller?.storeSlug || data.seller?.storeName;
        if (!slug) return navigate('/', { replace: true });
        if (target === 'order') navigate(`/${slug}/order`, { replace: true });
        else if (target === 'cart') navigate(`/${slug}/cart`, { replace: true });
        else navigate(`/${slug}`, { replace: true });
      } catch (err) {
        console.error('Redirect error', err);
        navigate('/', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [sellerId, navigate, target]);

  if (loading) return <div style={{padding:20}}>Redirecting…</div>;
  return null;
};

export default SellerToStore;
