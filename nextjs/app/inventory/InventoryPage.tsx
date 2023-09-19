'use client';

import { InventoryWithDeals } from '@/types/prisma/inventory';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Stack,
} from '@chakra-ui/react';
import InventoryCard from '@/components/display/InventoryCard';
import InventoryForm from '@/components/forms/InventoryForm';

const InventoryPage = ({ inventory }: { inventory: InventoryWithDeals }) => {
  return (
    <Stack>
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href={`/inventory`}>Inventory</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{inventory.vin.slice(-6).toUpperCase()}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      <Heading>Inventory</Heading>
      <InventoryCard inventory={inventory} />
      <InventoryForm withSearch={true} id={inventory.id} selectedId={inventory.id} />
    </Stack>
  );
};

export default InventoryPage;
