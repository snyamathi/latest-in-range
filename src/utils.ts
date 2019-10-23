import https from "https";

export const get = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const req = https.get(url, res => {
      const buffers: Buffer[] = [];
      res.on("data", buffer => buffers.push(buffer));
      res.on("end", () => resolve(Buffer.concat(buffers).toString()));
    });
    req.on("error", reject);
  });
};

export const getJSON = async (url: string): Promise<any> => {
  const text = await get(url);
  return JSON.parse(text);
};
