import { STORES, STORE_IDS } from '../data/stores';
import { useShopStore } from '../store/shopStore';

export function StoreSwitcher() {
  const storeId = useShopStore((s) => s.storeId);
  const switchStore = useShopStore((s) => s.switchStore);

  return (
    <label className="store-switcher">
      <span className="store-switcher__label">Demo store</span>
      <select
        value={storeId}
        onChange={(e) => switchStore(e.target.value)}
        aria-label="Switch demo merchant"
      >
        {STORE_IDS.map((id) => (
          <option key={id} value={id}>
            {STORES[id].name}
          </option>
        ))}
      </select>
    </label>
  );
}
