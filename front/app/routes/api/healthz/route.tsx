import { json } from '@remix-run/node';

export async function loader() {
  return json({ message: 'Service is healthy.', uptime: process.uptime() }, { status: 200 });
}
