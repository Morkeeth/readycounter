import { PRODUCTS } from '../data/catalog';

/** JSON-LD ItemList for agent-readable catalog (81% PDP gap). */
export function catalogJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Ember & Oak Coffee Catalog',
    itemListElement: PRODUCTS.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: product.name,
        description: product.description,
        sku: product.id,
        ...(product.gtin ? { gtin13: product.gtin } : {}),
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: product.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  };
}
