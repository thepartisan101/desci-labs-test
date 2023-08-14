// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import { create } from "ipfs-http-client";

// Connect to the default IPFS API address http://localhost:5001
const client = create();


// Declare Note type
export type BasicIpfsData = {
  cid: string;
  content: string;
  metadata: {
    userAddress: string;
  };
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
    const { noteData } = req.body;

    if (!noteData) {
      return res.status(400).json({ error: "Content is required." });
    }


    let data;
    // Call Core API methods to add the content to IPFS
    try {
      data = await client.add(Buffer.from(JSON.stringify(noteData)));
      // Pin data to local node to persist in event of node re-start
      await client.pin.add(data.cid);
      // rest of the logic
    } catch (error) {
        console.error("Error adding data to IPFS:", error);
        return res.status(500).json({ error: "Failed to add data to IPFS." });
    }


    // Store the note in memory
    const newNote: BasicIpfsData = {
      cid: data.path,
      content: noteData.text,
      metadata: {
        userAddress: noteData.metadata.userAddress
      }
    };
    notes.push(newNote);

    // Log to verify the note is added correctly
    console.log("Notes array after addition:", notes);

    // Respond with the CID and content in the response
    res.status(200).json(newNote);
  } else if (req.method === "GET") {
    if (!req.query.address) {
      return res.status(400).json({ error: "Address is required." });
    }
    retrievePinnedData(req, res);
  } else {
    // Handle any other HTTP method
    res.status(405).json({ error: "Method not allowed." });
  }
}

const retrievePinnedData = async (
  req: NextApiRequest,
  res: NextApiResponse<BasicIpfsData[] | ErrorResponse>
) => {
  const userAddress = req.query.address;

  let pinnedCids = [];

  try {
    for await (const pin of client.pin.ls()) {
      pinnedCids.push(pin.cid.toString());
    }
  } catch (err) {
    console.error("Error fetching pinned CIDs:", err);
    return res.status(500).json({ error: "Failed to retrieve pinned CIDs." });
  }

  const parsedNotes = pinnedCids.map(async (cid) => {
    try {
      let contentChunks = [];
      for await (const chunk of client.cat(cid)) {
        contentChunks.push(chunk);
      }
      const noteContent = Buffer.concat(contentChunks).toString();

      console.log("Raw IPFS retrieval result for CID:", cid, noteContent);

      const parsedContent = JSON.parse(noteContent);

      // Validate the structure before returning it
      if (parsedContent.text && parsedContent.metadata && parsedContent.metadata.userAddress) {
        return {
          cid: cid,
          content: parsedContent.text,
          metadata: parsedContent.metadata
        };
      } else {
        console.warn(`CID ${cid} does not match expected structure.`);
        return null; // Return null for invalid structures
      }

    } catch (err) {
      console.error("Error fetching content for CID:", cid, err);
      return null; // Return null for errors during parsing or fetching
    }
  });

  try {
    const allNotes = await Promise.all(parsedNotes);
    // Filter out null values (from errors or invalid structures)
    const validNotes: BasicIpfsData[] = allNotes.filter((note): note is BasicIpfsData => Boolean(note));

    // Filter notes by userAddress
    const userNotes = validNotes.filter(
      note => note.metadata && note.metadata.userAddress === userAddress
    );

    if (userNotes && userNotes.length > 0) {
      res.status(200).json(userNotes);
    } else {
      res.status(404).json({ error: "No notes found for this user." });
    }

  } catch (error) {
    console.error("Error processing notes:", error);
    res.status(500).json({ error: "Failed to retrieve notes." });
  }
};




