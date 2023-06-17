import { NextApiRequest, NextApiResponse } from 'next';

const fetchUnsplash = async (query: string) => {
  const urlParams = new URLSearchParams({
    query,
    orientation: 'landscape',
    content_filter: 'high',
    client_id: process.env.UNSPLASH_ACCESS_KEY as string,
  });
  const url = `https://api.unsplash.com/search/photos/?${urlParams.toString()}`;
  console.log(url);
  return fetch(url);
};

export default async function unsplashPhotoHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  let { query } = req.query;

  if (!query) {
    query = 'old pickup';
  }

  const fetched = await fetchUnsplash(query as string);

  const json = await fetched.json();

  console.log(json);

  const { results } = json;

  const random = Math.floor(Math.random() * results.length);

  return res.send(results[random]);
}
