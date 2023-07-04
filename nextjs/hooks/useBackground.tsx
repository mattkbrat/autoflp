'use client';

import { useEffect, useState } from 'react';

type Background = {
  image: {
    unsplash: string;
    direct: string;
    height: number;
    width: number;
  };
  attribution: {
    name: string;
    link: string;
  };
};

/**
 * Fetches a background image from Unsplash and stores it in session storage
 * @param query The query to search for
 */
export default function useBackground({ query }: { query?: string | null }): {
  background: Background;
  deleteBackground: () => void;
} {
  const [background, setBackground] = useState<Background | null>(() => {
    if (query === null) return null;
    const image =
      typeof sessionStorage !== 'undefined' &&
      sessionStorage.getItem('background-image-' + query);
    if (!image) return null;
    const parsed = JSON.parse(image);
    if (parsed instanceof Object) return JSON.parse(image);
    return null;
  });

  const deleteBackground = () => {
    sessionStorage.removeItem('background-image-' + query);
    setBackground(null);
  };

  useEffect(() => {
    if (background) return;
    if (query === null) return;
    fetch('/api/unsplash/?query=' + query)
      .then((res) => res.json())
      .then((json) => {
        const bg: Background = {
          image: {
            direct: json.urls.regular || (json.urls.full as string),
            unsplash: json.links.html as string,
            height: json.height,
            width: json.width,
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
          height: 0,
          width: 0,
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
