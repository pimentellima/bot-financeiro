export async function sendMessageToWhatsapp(
    apiToken: string,
    numberId: string,
    number: string,
    message: string
) {
    const url = `https://graph.facebook.com/v22.0/${numberId}/messages`
    const body = JSON.stringify({
        messaging_product: 'whatsapp',
        to: number,
        type: 'text',
        text: { body: message },
    })
    return await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
        },
        body,
    })
}
