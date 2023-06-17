'use client';

import { useEffect, useState } from 'react';

type Background = {
  image: {
    unsplash: string;
    direct: string;
  };
  attribution: {
    name: string;
    link: string;
  };
};

export default function useBackground({ query }: { query?: string }) {
  const [background, setBackground] = useState<Background | null>(() => {
    const image = sessionStorage.getItem('background-image-' + query);
    if (!image) return null;
    return image.startsWith('{') ? (JSON.parse(image) as Background) : null;
  });

  const deleteBackground = () => {
    sessionStorage.removeItem('background-image-' + query);
    setBackground(null);
  };

  useEffect(() => {
    if (background) return;
    fetch('/api/unsplash/?query=' + query)
      .then((res) => res.json())
      .then((json) => {
        const bg = {
          image: {
            direct: json.urls.regular || (json.urls.full as string),
            unsplash: json.links.html as string,
          },
          attribution: {
            name: json.user.name as string,
            link: json.user.links.html as string,
          },
        };
        sessionStorage.setItem('background-image-' + query, JSON.stringify(bg));
        return bg;
      })
      .then((url) => {
        setBackground(url);
      });
  }, [query, background]);

  if (!background)
    return {
      background: {
        image: {
          unsplash: '',
          direct: '',
        },
        attribution: {
          name: '',
          link: '',
        },
      },
      deleteBackground,
    };

  return {
    background,
    deleteBackground,
  };
}
