import { progressManager } from '$lib/server/rss/events';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ url }) => {
    const id = url.searchParams.get('id');

    if (!id) {
        return new Response('Missing id', { status: 400 });
    }

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();
            let isClosed = false;
            
            const unsubscribe = progressManager.subscribe(id, (event) => {
                if (isClosed) return;

                try {
                    const data = `data: ${JSON.stringify(event)}\n\n`;
                    controller.enqueue(encoder.encode(data));
                } catch (e) {
                    isClosed = true;
                    return;
                }
                
                if (event.type === 'success' || event.type === 'error') {
                    // Schedule closing the stream after the final message is likely sent
                    setTimeout(() => {
                        if (!isClosed) {
                            try {
                                controller.close();
                            } catch (e) {
                                // Ignore if already closed
                            }
                            isClosed = true;
                        }
                    }, 1000);
                }
            });

            // Keep alive heartbeat
            const interval = setInterval(() => {
                if (isClosed) return;
                try {
                    controller.enqueue(encoder.encode(': heartbeat\n\n'));
                } catch (e) {
                    isClosed = true;
                }
            }, 15000);

            return () => {
                isClosed = true;
                unsubscribe();
                clearInterval(interval);
            };
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        }
    });
};
