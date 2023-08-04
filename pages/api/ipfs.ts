// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { create } from "ipfs-http-client";

// arbitrary response format
export type BasicIpfsData = {
  cid: string;
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData>
) {
  if (req.method === "POST") {
    // Process a POST request
  } else {
    // Handle any other HTTP method
    retrieveData(req, res);
  }
}

const retrieveData = async (
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData>
) => {
  // connect to the default API address http://localhost:5001
  const client = create();
  // call Core API methods
  const string = "Hello world!";
  const data = await client.add(string);

  console.log(data);

  res.status(200).json({ cid: data.path, content: string });
};
