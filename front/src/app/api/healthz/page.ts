import type { NextApiRequest, NextApiResponse } from 'next';

type ResponseData = {
  message: string;
  uptime: number;
};

export default function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  res.status(200).json({ message: 'Service is healthy.', uptime: process.uptime() });
}
