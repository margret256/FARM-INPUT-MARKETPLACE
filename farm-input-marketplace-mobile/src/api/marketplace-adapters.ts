import type { ImageSourcePropType } from 'react-native';

import type { DealerProduct } from './products';
import { appImages, type ProductItem } from '@/constants/mock-marketplace';

const fallbackImages: ImageSourcePropType[] = [
  appImages.fastPayments,
  appImages.betterYields,
  appImages.agroHub,
  appImages.smartFarming,
  appImages.farmStatus,
];

export function formatUgx(value: number | string | undefined) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return 'UGX 0';
  return `UGX ${amount.toLocaleString('en-US')}`;
}

export function productImage(index = 0) {
  return fallbackImages[index % fallbackImages.length];
}

export function productToCard(product: DealerProduct, index = 0): ProductItem {
  const status =
    product.stockStatus === 'OUT_OF_STOCK'
      ? 'out-of-stock'
      : product.stockStatus === 'LOW_STOCK'
        ? 'low-stock'
        : 'in-stock';

  return {
    id: product.id,
    name: product.name,
    subtitle: product.dealer?.businessName ?? product.category?.name ?? 'AgroConnect dealer',
    price: formatUgx(product.price),
    rating: '',
    image: productImage(index),
    badge: product.statusLabel,
    status,
  };
}
