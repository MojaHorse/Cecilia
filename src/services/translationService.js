const LANG_MAP = {
  sesotho: 'st',
  zulu: 'zu',
  xhosa: 'xh',
  setswana: 'tn',
  english: 'en'
}

/**
 * Translates text using the free Google Translate API endpoint.
 * Note: This is an unofficial endpoint used for small integrations.
 * It works via POST to avoid URL length limits and preserves basic HTML tags.
 */
export async function translateText(text, targetLang) {
  if (!text) return text
  if (targetLang === 'english') return text

  const tl = LANG_MAP[targetLang]
  if (!tl) return text

  try {
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `q=${encodeURIComponent(text)}`
    })

    if (!response.ok) {
      throw new Error(`Translation API failed with status: ${response.status}`)
    }

    const data = await response.json()
    
    // Google Translate splits the response into chunks. 
    // We iterate over the first array and concatenate the translated chunks.
    let translated = ''
    if (data && data[0]) {
      data[0].forEach(chunk => {
        if (chunk && chunk[0]) {
          translated += chunk[0]
        }
      })
    }

    return translated || text
  } catch (error) {
    console.error("Translation error:", error)
    // Fallback to English if translation fails
    return text
  }
}

/**
 * Helper to translate an entire reading object while preserving its structure.
 */
export async function translateReading(reading, targetLang) {
  if (!reading || targetLang === 'english') return reading

  const translatedReading = { ...reading }

  if (reading.heading) {
    translatedReading.heading = await translateText(reading.heading, targetLang)
  }
  if (reading.text) {
    translatedReading.text = await translateText(reading.text, targetLang)
  }
  // We typically don't translate the source citation (e.g. "Genesis 1:1") because 
  // it might garble the reference, but we can translate it if desired.
  // For now, let's preserve the source as is.

  return translatedReading
}
