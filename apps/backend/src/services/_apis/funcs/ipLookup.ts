export const ipLookup = async (ip: string) => {
  const response = await fetch(`https://get.geojs.io/v1/ip/geo/${ip}.json`);
  const data = (await response.json()) as {
    country: string;
    country_code: string;
    continent_code: string;
    city: string;
    region: string;
  };

  return data;
};
