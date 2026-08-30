import { useState } from 'react';
import { listStoreIds, getStore, STORES } from '../data/stores';
import { useShopStore } from '../store/shopStore';

export function StoreSwitcher() {
  const storeId = useShopStore((s) => s.storeId);
  const switchStore = useShopStore((s) => s.switchStore);
  const [ids, setIds] = useState(listStoreIds);

  const refreshIds = () => setIds(listStoreIds());

  return (
    <label className="store-switcher">
      <span className="store-switcher__label">Store</span>
      <select
        value={storeId}
        onChange={(e) => switchStore(e.target.value)}
        onFocus={refreshIds}
        aria-label="Switch store"
      >
        {ids.map((id) => (
          <option key={id} value={id}>
            {getStore(id).name}
            {STORES[id] ? '' : ' · yours'}
          </option>
        ))}
      </select>
    </label>
  );
}
