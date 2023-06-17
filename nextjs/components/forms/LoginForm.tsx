'use client';

import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [user, setUser] = useState<{
    username: '';
    password: '';
  }>({
    username: '',
    password: '',
  });

  const toast = useToast();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLDivElement>) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });

    const json = await res.json();

    toast({
      title: json.message,
      status: json.status,
      description: res.ok ? 'Redirecting...' : 'Please try again.',
      duration: 5000,
      isClosable: true,
    });

    if (res.ok) {
      setTimeout(() => {
        router.push('/');
      }, 5000);
    }

    console.log(json);
  };

  return (
    <Stack spacing={4} as={'form'} onSubmit={onSubmit}>
      <Heading>Login</Heading>
      <FormControl>
        <FormLabel htmlFor="username" fontSize={'lg'}>
          Username
          <Input
            id={'username'}
            name="username"
            value={user.username}
            onChange={handleChange}
          />
        </FormLabel>
        <FormControl>
          <FormLabel htmlFor="password" fontSize={'lg'}>
            Password
            <InputGroup>
              <Input
                id={'password'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={user.password}
                onChange={handleChange}
              />
              <InputRightElement w={'25%'}>
                <Button
                  variant={'ghost'}
                  w={'full'}
                  h={'1.75rem'}
                  size={'sm'}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </Button>
              </InputRightElement>
            </InputGroup>
          </FormLabel>
        </FormControl>
      </FormControl>
      <Button colorScheme={'blue'} type={'submit'}>
        Login
      </Button>
    </Stack>
  );
}
