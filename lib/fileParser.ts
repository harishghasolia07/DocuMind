/**
 * fileParser.ts
 *
 * Centralised text-extraction utility. Given a browser File object, it
 * dispatches to the right parser based on the file extension and returns
 * the plain-text content as a string.
 *
 * Supported formats
 * -----------------
 *  .txt  — native File.text() (no library)
 *  .md   — native File.text() (stored/indexed as raw markdown text)
 *  .csv  — native File.text() (tab/comma separated values stay readable)
 *  .json — native File.text() (JSON structure stays readable)
 *  .pdf  — pdf-parse: extracts all text layers from the PDF buffer
 *  .docx — mammoth:  strips OOXML, returns plain prose text
 */

import mammoth from 'mammoth';

/** File extensions we accept — keep in sync with UploadForm.tsx */
export const ALLOWED_EXTENSIONS = new Set([
    '.txt',
    '.md',
    '.csv',
    '.json',
    '.pdf',
    '.docx',
]);

/** Human-readable label used for the <input accept> attribute */
export const ACCEPTED_MIME_TYPES =
    '.txt,.md,.csv,.json,.pdf,.docx';

/**
 * Extract plain text from any supported file type.
 *
 * @param file - A browser `File` object (available in Next.js server actions
 *               via `FormData.get('file') as File`)
 * @returns Resolved text content of the file
 * @throws  Error with descriptive message for unsupported / unreadable files
 */
export async function extractTextFromFile(file: File): Promise<string> {
    const ext = getExtension(file.name);

    if (!ALLOWED_EXTENSIONS.has(ext)) {
        throw new Error(
            `Unsupported file type "${ext}". Allowed: ${[...ALLOWED_EXTENSIONS].join(', ')}`
        );
    }

    switch (ext) {
        // ── Plain-text variants ──────────────────────────────────────────────────
        case '.txt':
        case '.md':
        case '.csv':
        case '.json': {
            return file.text();
        }

        // ── PDF ─────────────────────────────────────────────────────────────────
        case '.pdf': {
            const buffer = Buffer.from(await file.arrayBuffer());
            const pdfParseModule = await import('pdf-parse/lib/pdf-parse.js');
            const pdfParse = (pdfParseModule as unknown as { default?: (dataBuffer: Buffer) => Promise<{ text?: string }> }).default
                ?? (pdfParseModule as unknown as (dataBuffer: Buffer) => Promise<{ text?: string }>);
            const result = await pdfParse(buffer);
            const text = result.text?.trim();
            if (!text) {
                throw new Error(
                    'Could not extract text from the PDF. The file may be scanned/image-only.'
                );
            }
            return text;
        }

        // ── DOCX ────────────────────────────────────────────────────────────────
        case '.docx': {
            const buffer = Buffer.from(await file.arrayBuffer());
            const result = await mammoth.extractRawText({ buffer });
            const text = result.value?.trim();
            if (!text) {
                throw new Error('Could not extract text from the DOCX file.');
            }
            return text;
        }

        default:
            // Satisfies TypeScript exhaustiveness — unreachable at runtime
            throw new Error(`Unhandled extension: ${ext}`);
    }
}

// ─── Internal helpers ────────────────────────────────────────────────────────

/**
 * Returns the lowercased extension of a filename, e.g. "Report.PDF" → ".pdf"
 */
function getExtension(filename: string): string {
    const idx = filename.lastIndexOf('.');
    if (idx === -1) return '';
    return filename.slice(idx).toLowerCase();
}
