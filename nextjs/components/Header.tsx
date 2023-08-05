'use client';

import { useCallback, useEffect, useState } from 'react';
import { GiHamburgerMenu } from 'react-icons/gi';

import Image from 'next/image';
import Link from 'next/link';

import useSWR from 'swr';

import ToggleColorModeButton from '@/components/ToggleColorModeButton';
import useIsMobile from '@/hooks/useIsMobile';
import signOut from '@/utils/fetchers/signOut';
import {
  Box,
  Button,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
  Skeleton,
  Text,
  UnorderedList,
  useColorModeValue,
} from '@chakra-ui/react';
import GlobalSearch, { SearchOption } from '@/app/GlobalSearch';

const fetcher = (url: string) => fetch(url).then((res) => res.json());
const logoSrc = '/images/logo.png';

const ProfileMenu = ({ username }: { username: string }) => {
  return (
    <Menu>
      <MenuButton as={Button} colorScheme="blue" variant={'outline'}>
        Profile
      </MenuButton>
      <MenuList textAlign={'right'}>
        <MenuGroup title={username}>
          <Link href={'/profile'} passHref>
            <MenuItem id={'menu-item-profile'} w={'full'}>
              Profile
            </MenuItem>
          </Link>
        </MenuGroup>
        <MenuDivider />
        <MenuItem
          onClick={async () => {
            await signOut({});
          }}
        >
          Sign Out
        </MenuItem>
        {/*<MenuDivider />*/}
        {/*<MenuGroup title="Help">*/}
        {/*  <MenuItem>Docs</MenuItem>*/}
        {/*  <MenuItem>FAQ</MenuItem>*/}
        {/*</MenuGroup>*/}
      </MenuList>
    </Menu>
  );
};

export default function Header({
  searchOptions,
}: {
  searchOptions: SearchOption[];
}) {
  const [scrolled, setScrolled] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  const [collapseNav, setCollapseNav] = useState(true);

  const { data: user, isLoading } = useSWR('/api/auth/session', fetcher, {
    refreshInterval: 1000 * 60, // 1 minute
  });

  useEffect(() => {
    setHasInitialLoad(!!user);
  }, [user]);

  const isMobile = useIsMobile();

  const handleScroll = useCallback(() => {
    const hasScrolled =
      window.scrollY !== undefined
        ? window.scrollY > 0
        : document.documentElement.scrollTop > 0;

    if (hasScrolled && !scrolled) {
      setScrolled(true);
    } else if (!hasScrolled && scrolled) {
      setScrolled(false);
    }
  }, [scrolled, setScrolled]);

  useEffect(() => {
    // Check if event listener is already added
    if (window.scrollY !== undefined) {
      window.addEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  useEffect(() => {
    !isMobile && collapseNav && setCollapseNav(false);
  }, [isMobile, collapseNav]);

  const bg = useColorModeValue('rgba(255,255,255,0.7)', 'rgba(0,0,0,0.7)');

  if (!user) {
    return (
      <Box py={4} px={2}>
        <Image width={80} height={20} src={logoSrc} alt={'Auto FLP'} />
      </Box>
    );
  }

  const Nav = () => {
    return (
      <UnorderedList
        gap={4}
        display={'flex'}
        bg={isMobile ? bg : undefined}
        flexDir={isMobile ? 'column' : 'row'}
        padding={isMobile && !collapseNav ? 4 : undefined}
        textAlign={isMobile ? 'right' : undefined}
        // justifyContent={isMobile ? 'flex-end' : undefined}
        // alignItems={'center'}
        margin={0}
        listStyleType={'none'}
      >
        {isMobile && (
          <ListItem w={'full'} display={!collapseNav ? 'block' : 'none'}>
            <DrawerCloseButton />
          </ListItem>
        )}
        {/*<ListItem w={'full'} display={!collapseNav ? 'block' : 'none'}>*/}
        {/*  <Link*/}
        {/*    style={{*/}
        {/*      display: 'inline-block',*/}
        {/*      width: '100%',*/}
        {/*    }}*/}
        {/*    href={'/'}*/}
        {/*  >*/}
        {/*    Home*/}
        {/*  </Link>*/}
        {/*</ListItem>*/}
        <ListItem w={'full'} display={!collapseNav ? 'block' : 'none'}>
          <Link
            style={{
              display: 'inline-block',
              width: '100%',
            }}
            href={'/map'}
          >
            Map
          </Link>
        </ListItem>

        <ListItem w={'full'} display={!collapseNav ? 'block' : 'none'}>
          <Link
            style={{
              display: 'inline-block',
              width: '100%',
            }}
            href={'/contact'}
          >
            Contact
          </Link>
        </ListItem>
        {user?.role?.toLowerCase() === 'admin' && (
          <ListItem w={'full'} display={!collapseNav ? 'block' : 'none'}>
            <Link
              style={{
                display: 'inline-block',
                width: '100%',
              }}
              href={'/admin'}
            >
              Admin
            </Link>
          </ListItem>
        )}
        <ListItem w={'full'} display={!collapseNav ? 'block' : 'none'}></ListItem>
        {isMobile && isMobile && (
          <>
            <Divider />
            <Text
              fontSize={'sm'}
              fontWeight={'bold'}
              textTransform={'uppercase'}
              color={'gray.500'}
            >
              {user?.username}
            </Text>
            <ListItem w={'full'}>
              <Link
                style={{
                  display: 'inline-block',
                  width: '100%',
                }}
                href={'/profile'}
              >
                Profile
              </Link>
            </ListItem>

            <ListItem
              _hover={{ cursor: 'pointer' }}
              w={'full'}
              display={!collapseNav ? 'block' : 'none'}
              onClick={async () => {
                await signOut({});
              }}
            >
              Sign Out
            </ListItem>
          </>
        )}
      </UnorderedList>
    );
  };

  return (
    <Skeleton
      position={'sticky'}
      bg={scrolled ? bg : undefined}
      transition={'background-color 0.2s ease-in-out'}
      top={0}
      zIndex={1}
      isLoaded={hasInitialLoad}
    >
      <Box
        as={'header'}
        bg={scrolled ? bg : undefined}
        fontSize={'lg'}
        justifyContent={'space-between'}
        display={'flex'}
        alignItems={'center'}
        py={4}
        px={2}
      >
        <Flex>
          <Link href={'/'} passHref>
            <Image width={80} height={20} src={logoSrc} alt={'Auto FLP'} />
          </Link>
          <ToggleColorModeButton />
        </Flex>
        {isMobile ? (
          <>
            <IconButton
              position={'fixed'}
              top={4}
              right={4}
              zIndex={2}
              size={'sm'}
              bg={bg}
              aria-label={'expand nav'}
              onClick={() => setCollapseNav(!collapseNav)}
              as={GiHamburgerMenu}
            />
            <Drawer
              id={'mobile-nav-drawer'}
              isOpen={!collapseNav}
              onClose={() => setCollapseNav(!collapseNav)}
              placement={'right'}
            >
              <DrawerOverlay />
              <DrawerContent h={'min-content'} w={'min-content'}>
                <DrawerBody
                  position={'absolute'}
                  top={0}
                  right={0}
                  zIndex={1}
                  bg={bg}
                >
                  <Nav />
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          </>
        ) : (
          <>
            <Nav />
            <GlobalSearch searchOptions={searchOptions} />
            <ProfileMenu username={user?.username} />
          </>
        )}
      </Box>
    </Skeleton>
  );
}
