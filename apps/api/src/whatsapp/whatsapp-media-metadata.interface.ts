export interface WhatsAppMediaMetadata {
    messaging_product: 'whatsapp'
    url: string // Media URL (valid for 5 minutes)
    mime_type: string // MIME type of the media, e.g., 'video/mp4'
    sha256: string // SHA-256 hash of the file
    file_size: string // File size in bytes (as a string)
    id: string // Media ID
}
