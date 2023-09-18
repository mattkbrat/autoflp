'use client';

import BackgroundLayout from '@/components/layouts/BackgroundLayout';
import Link from 'next/link';
import { Divider, Heading, Text } from '@chakra-ui/react';

const HomePage = () => {
  return (
    <BackgroundLayout
      spacing={4}
      withGradient={false}
      backgroundImage={'chevrolet c10'}
    >
      <Heading>Auto FLP</Heading>
      <Text fontSize={'xl'} color={'gray.500'}>
        An Auto Dealer Management System for Family Owned Businesses.{' '}
      </Text>
      <Divider />
      <Link href={'/accounts'} passHref>
        <Text as={'span'} fontSize={'2xl'}>
          Accounts
        </Text>
      </Link>
      <Link href={'/inventory'} passHref>
        <Text as={'span'} fontSize={'2xl'}>
          Inventory
        </Text>
      </Link>
      <Link href={'/deal'} passHref>
        <Text as={'span'} fontSize={'2xl'}>
          New Deal
        </Text>
      </Link>
      <Link href={'/admin'}>
        <Text as={'span'} fontSize={'2xl'}>
          Admin
        </Text>
      </Link>
      <Link href={'/applications'}>
        <Text as={'span'} fontSize={'2xl'}>
          Credit Apps
        </Text>
      </Link>
    </BackgroundLayout>
  );
};

export default HomePage;
