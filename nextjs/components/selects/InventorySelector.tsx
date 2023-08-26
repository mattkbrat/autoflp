import { Inventory } from "@prisma/client";
import { Searcher } from "fast-fuzzy";
import { use, useEffect, useMemo, useState } from "react";
import DropdownCombobox from "../ComboBox";
import formatInventory from "@/utils/format/formatInventory";
import { Spinner } from "@chakra-ui/react";

const InventorySelector = ({
    inventory: defaultInventory,
    selected,
    setSelected
}: {
    inventory?: Inventory[];
    selected: string | number;
    setSelected: (arg1: string | number) => void;
}) => {

    const [inventory, setInventory] = useState<Inventory[] | null>(defaultInventory || null);

    // const selector = useMemo(() => {
    //     return new Searcher(inventory, {
    //         keySelector: (inventory) => inventory.vin,
    //     });
    // }, [inventory]);

    useEffect(() => {
        if (!inventory) {
            fetch(`/api/inventory`)
                .then((res) => res.json())
                .then((data) => {
                    setInventory(data);
                }
                );
        }
    }, [inventory]);

    const inventoryFormatted = useMemo(() => {
        return inventory?.map((inventory) => {
            return {
            id: inventory.id,
            formatted: formatInventory(inventory)
        }
        });
    }, [inventory]);

    if (!inventoryFormatted){
        return (
            <Spinner />
        )
    }

    return (
        <DropdownCombobox
            options={inventoryFormatted.map((inventory) => inventory.formatted)}
            value={selected}
            setValue={(e) => {
                setSelected(
                    inventoryFormatted.find((inventory) => inventory.formatted === e)?.id || 0
                )
            }}
            placeholder={'Select inventory'}
        />

    )
}

export default InventorySelector;