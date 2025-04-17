export interface WhatsAppWebhookPayload {
    object: string
    entry: Entry[]
}

export interface Entry {
    id: string
    changes: Change[]
}

export interface Change {
    value: WebhookValue
    field: string
}

export interface WebhookValue {
    messaging_product: 'whatsapp'
    metadata: {
        display_phone_number: string
        phone_number_id: string
    }
    contacts?: Contact[]
    messages?: Message[]
    statuses?: Status[]
}

export interface Contact {
    profile: {
        name: string
    }
    wa_id: string
}

export interface Message {
    from: string
    id: string
    timestamp: string
    type: 'text' | 'image' | 'sticker' | 'unknown' | 'button' | 'interactive' | 'reaction' | 'audio'
    text?: {
        body: string
    }
    reaction?: {
        message_id: string
        emoji: string
    }
    image?: Media
    audio?: Media
    video?: Media
    document?: Media
    button?: {
        payload: string
        text: string
    }
    interactive?: {
        type: 'button_reply' | 'list_reply'
        button_reply?: {
            id: string
            title: string
        }
        list_reply?: {
            id: string
            title: string
            description: string
        }
    }
    location?: {
        latitude: number
        longitude: number
        name?: string
        address?: string
    }
    contacts?: any // You can define this more deeply if needed
    context?: {
        from: string
        id: string
    }
}

export interface Media {
    mime_type: string
    sha256: string
    id: string
}

export interface Status {
    id: string
    status: string
    timestamp: string
    recipient_id: string
    conversation?: {
        id: string
        origin: {
            type: string
        }
    }
    pricing?: {
        billable: boolean
        pricing_model: string
        category: string
    }
    errors?: Array<{
        code: number
        title: string
        details: string
    }>
}

type MessageStatus = 'delivered' | 'sent' | 'read' | 'failed'
