import { Inventory } from '@prisma/client';
import { useEffect, useMemo, useRef, useState } from 'react';
import DropdownCombobox from '../ComboBox';
import formatInventory from '@/utils/format/formatInventory';
import { Spinner } from '@chakra-ui/react';

const InventorySelector = ({
  inventory: defaultInventory,
  state = 1,
  selected,
  setSelected,
  setPrices,
  setSelectedType = 'vin',
}: {
  inventory?: Inventory[];
  selected: string | number;
  setSelected: (arg1: string | number) => void;
  setSelectedType?: 'vin' | 'id';
  state?: 0 | 1 | 'all';
  setPrices: (arg1: {
    selling?: number;
    trading?: number | null;
    credit?: number;
    cash?: number;
    down?: number;
  }) => void;
}) => {
  const stateRef = useRef(state);

  const [inventory, setInventory] = useState<Inventory[] | null>(
    defaultInventory || null,
  );

  useEffect(() => {
    if (state !== stateRef.current) {
      setInventory(null);
      stateRef.current = state;
    }
  }, [state, stateRef]);

  useEffect(() => {
    if (!selected) {
      console.warn('No selected inventory');
      return;
    }
    const matching = inventory?.find(
      (inventory) => inventory.id === selected || inventory.vin === selected,
    );
    if (!matching) {
      console.warn('No matching inventory found for id ' + selected);
      return;
    }
    console.log('matching', matching);
    setPrices({
      selling: +(matching.cash ?? 0),
      down: +(matching.down ?? 0),
      cash: +(matching.cash ?? 0),
      credit: +(matching.credit ?? 0),
    });
  }, [inventory, selected]);

  // const selector = useMemo(() => {
  //     return new Searcher(inventory, {
  //         keySelector: (inventory) => inventory.vin,
  //     });
  // }, [inventory]);

  useEffect(() => {
    if (!inventory) {
      fetch(`/api/inventory?state=` + state)
        .then((res) => res.json())
        .then((data) => {
          setInventory(data);
        });
    }
  }, [inventory]);

  const inventoryFormatted = useMemo(() => {
    return inventory?.map((inventory) => {
      return {
        id: inventory.id,
        formatted: formatInventory(inventory),
        vin: inventory.vin,
      };
    });
  }, [inventory]);

  if (!inventoryFormatted) {
    return <Spinner />;
  }

  return (
    <DropdownCombobox
      options={inventoryFormatted.map((inventory) => inventory.formatted)}
      value={selected}
      setValue={(e) => {
        setSelected(
          inventoryFormatted.find((inventory) => inventory.formatted === e)?.[
            setSelectedType
          ] || 0,
        );
      }}
      placeholder={'Select inventory'}
    />
  );
};

export default InventorySelector;
