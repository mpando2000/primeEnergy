import { useEffect, useRef, useState } from 'react';
import { GlobalWorkerOptions, getDocument, type RenderTask } from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfCanvasProps {
    src: string;
    pageNumber?: number;
    maxWidth?: number;
    className?: string;
    onDocumentLoad?: (pages: number) => void;
}

export default function PdfCanvas({
    src,
    pageNumber = 1,
    maxWidth = 900,
    className = '',
    onDocumentLoad,
}: PdfCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        let active = true;
        let renderTask: RenderTask | null = null;
        const loadingTask = getDocument(src);

        setLoading(true);
        setFailed(false);

        loadingTask.promise
            .then(async (document) => {
                if (!active) return;

                onDocumentLoad?.(document.numPages);
                const safePage = Math.min(Math.max(pageNumber, 1), document.numPages);
                const page = await document.getPage(safePage);
                if (!active || !canvasRef.current) return;

                const baseViewport = page.getViewport({ scale: 1 });
                const scale = Math.min(maxWidth / baseViewport.width, 2);
                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');

                if (!context) throw new Error('Canvas is not available');

                canvas.width = Math.floor(viewport.width);
                canvas.height = Math.floor(viewport.height);
                renderTask = page.render({ canvas, canvasContext: context, viewport });
                await renderTask.promise;

                if (active) setLoading(false);
            })
            .catch((error) => {
                if (active && error?.name !== 'RenderingCancelledException') {
                    setFailed(true);
                    setLoading(false);
                }
            });

        return () => {
            active = false;
            renderTask?.cancel();
            void loadingTask.destroy();
        };
    }, [src, pageNumber, maxWidth, onDocumentLoad]);

    return (
        <div className={`relative flex min-h-32 items-center justify-center overflow-hidden bg-gray-100 ${className}`}>
            {loading && !failed && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Loading PDF…
                </div>
            )}
            {failed ? (
                <div className="p-6 text-center text-gray-500">
                    <i className="fas fa-file-pdf mb-2 block text-4xl text-red-600"></i>
                    PDF preview unavailable
                </div>
            ) : (
                <canvas ref={canvasRef} className="block h-auto max-w-full" />
            )}
        </div>
    );
}
