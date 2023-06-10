const SITE_URL = process.env.SITE_URL as string;

const handleUrl = (params: string) => {
  const url = `${SITE_URL.replaceAll('"', '')}/${params}`;

  // Check for valid url
  // const expression = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi;

  // const isValid = expression.test(url);

  // if (!isValid) {
  //     console.error("Invalid url", url);
  //     return;
  // }

  return url;
};

export default handleUrl;

// Use this function to handle urls in pushover notifications
