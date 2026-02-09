/**
 * CID Image Embedding Utility
 * 
 * This utility extracts images from HTML content and converts them to CID attachments
 * for reliable email delivery across all email clients.
 * 
 * Supported image sources:
 * - Base64 data URLs (data:image/...)
 * - External URLs (https://...)
 * 
 * Note: iframes, scripts, and other potentially unsafe elements are stripped
 * as most email clients block them for security.
 */

const axios = require('axios');
const crypto = require('crypto');

/**
 * Extracts images from HTML and converts them to CID attachments
 * @param {string} html - The HTML content containing images
 * @returns {Promise<{html: string, attachments: Array}>} - Modified HTML and attachments
 */
async function processInlineImages(html) {
    if (!html) {
        return { html: '', attachments: [] };
    }

    const attachments = [];
    let processedHtml = html;

    // Match all img tags with src attribute
    const imgRegex = /<img\s+[^>]*src=["']([^"']+)["'][^>]*>/gi;
    const matches = [...html.matchAll(imgRegex)];

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        const fullTag = match[0];
        const src = match[1];

        try {
            let imageBuffer;
            let mimeType;
            let extension;

            if (src.startsWith('data:image/')) {
                // Handle base64 data URL
                const parts = src.match(/^data:image\/([^;]+);base64,(.+)$/);
                if (parts) {
                    extension = parts[1]; // png, jpeg, gif, etc.
                    mimeType = `image/${extension}`;
                    imageBuffer = Buffer.from(parts[2], 'base64');
                }
            } else if (src.startsWith('http://') || src.startsWith('https://')) {
                // Handle external URL
                try {
                    const response = await axios.get(src, {
                        responseType: 'arraybuffer',
                        timeout: 10000, // 10 second timeout
                        maxContentLength: 10 * 1024 * 1024, // 10MB max
                    });

                    imageBuffer = Buffer.from(response.data);

                    // Determine MIME type from response headers or URL
                    const contentType = response.headers['content-type'] || '';
                    if (contentType.includes('image/')) {
                        mimeType = contentType.split(';')[0].trim();
                        extension = mimeType.split('/')[1];
                    } else {
                        // Fallback: guess from URL extension
                        const urlExt = src.split('.').pop()?.toLowerCase().split('?')[0];
                        const extMap = {
                            'jpg': 'jpeg', 'jpeg': 'jpeg', 'png': 'png',
                            'gif': 'gif', 'webp': 'webp', 'svg': 'svg+xml'
                        };
                        extension = extMap[urlExt] || 'png';
                        mimeType = `image/${extension}`;
                    }
                } catch (fetchError) {
                    console.warn(`⚠️ Failed to fetch image from URL: ${src.substring(0, 100)}...`, fetchError.message);
                    // Keep original src if fetch fails (fallback to URL reference)
                    continue;
                }
            } else {
                // Skip relative URLs or invalid sources
                continue;
            }

            if (imageBuffer && mimeType) {
                // Generate unique CID
                const cid = `image_${i}_${crypto.randomBytes(8).toString('hex')}@mailstorm`;

                // Create attachment
                attachments.push({
                    filename: `inline_image_${i}.${extension === 'svg+xml' ? 'svg' : extension}`,
                    content: imageBuffer,
                    cid: cid,
                    contentType: mimeType,
                    contentDisposition: 'inline',
                });

                // Replace src with CID reference
                const newTag = fullTag.replace(src, `cid:${cid}`);
                processedHtml = processedHtml.replace(fullTag, newTag);
            }
        } catch (error) {
            console.warn(`⚠️ Failed to process image ${i}:`, error.message);
            // Keep original src on error
        }
    }

    return { html: processedHtml, attachments };
}

/**
 * Sanitizes HTML for email by removing unsafe elements
 * Most email clients strip these anyway, but this ensures clean HTML
 * @param {string} html - The HTML to sanitize
 * @returns {string} - Sanitized HTML
 */
function sanitizeHtmlForEmail(html) {
    if (!html) return '';

    let sanitized = html;

    // Remove iframes (blocked by all major email clients)
    sanitized = sanitized.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<iframe[^>]*\/>/gi, '');

    // Remove scripts (always blocked)
    sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');

    // Remove video/audio tags (limited support)
    sanitized = sanitized.replace(/<video[^>]*>[\s\S]*?<\/video>/gi, '');
    sanitized = sanitized.replace(/<audio[^>]*>[\s\S]*?<\/audio>/gi, '');

    // Remove embed/object tags (security risk)
    sanitized = sanitized.replace(/<embed[^>]*>[\s\S]*?<\/embed>/gi, '');
    sanitized = sanitized.replace(/<embed[^>]*\/>/gi, '');
    sanitized = sanitized.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, '');

    // Remove style tags that might contain dangerous content
    // (inline styles on elements are OK)
    sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Remove form elements
    sanitized = sanitized.replace(/<form[^>]*>[\s\S]*?<\/form>/gi, '');
    sanitized = sanitized.replace(/<input[^>]*>/gi, '');
    sanitized = sanitized.replace(/<button[^>]*>[\s\S]*?<\/button>/gi, '');
    sanitized = sanitized.replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '');
    sanitized = sanitized.replace(/<textarea[^>]*>[\s\S]*?<\/textarea>/gi, '');

    // Remove event handlers (onclick, onload, etc.)
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
    sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

    return sanitized;
}

/**
 * Full HTML processing pipeline for email
 * 1. Sanitizes HTML to remove unsafe elements
 * 2. Converts images to CID attachments
 * @param {string} html - Raw HTML from editor
 * @returns {Promise<{html: string, inlineAttachments: Array}>}
 */
async function processHtmlForEmail(html) {
    // First sanitize
    const sanitized = sanitizeHtmlForEmail(html);

    // Then process images
    const { html: processedHtml, attachments } = await processInlineImages(sanitized);

    return {
        html: processedHtml,
        inlineAttachments: attachments,
    };
}

module.exports = {
    processInlineImages,
    sanitizeHtmlForEmail,
    processHtmlForEmail,
};
