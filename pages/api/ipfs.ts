// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { create } from "ipfs-http-client";

// arbitrary response format
export type BasicIpfsData = {
  cid: string;
  content: string;
};

export type ErrorResponse = {
  error: string;
};


// In-memory storage for notes
let notes: BasicIpfsData[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData | BasicIpfsData[] | ErrorResponse>
) {
  if (req.method === "POST") {
    // Assuming you have a local IPFS API running on http://localhost:5001
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Content is required." });
    }

    // Connect to the default IPFS API address http://localhost:5001
    const client = create();
    // Call Core API methods to add the content to IPFS
    const data = await client.add(text);

    console.log(data);

    // Store the note in memory
    const newNote: BasicIpfsData = { cid: data.path, content: text };
    notes.push(newNote);

    // Respond with the CID and content in the response
    res.status(200).json(newNote);
  } else if (req.method === "GET") {
    // Handle GET request for retrieving data
    retrieveData(req, res);
  } else {
    // Handle any other HTTP method
    res.status(405).json({ error: "Method not allowed." });
  }
}

const retrieveData = async (
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData[]>
) => {
  // Return the notes from the in-memory storage
  res.status(200).json(notes);
};

