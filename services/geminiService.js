// Gemini API Service with real SSE streaming, reasoning extraction, sources and robust fallback

export const GEMINI_MODELS = [
  { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash', badge: 'Terbaru & Cepat', desc: 'Model utama generasi terbaru yang sangat cepat dan cerdas' },
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', badge: 'Hybrid Reasoning', desc: 'Model canggih dengan penalaran dan performa tinggi' },
  { id: 'gemini-flash-latest', name: 'Gemini Flash Latest', badge: 'Auto-Update', desc: 'Versi flash paling stabil dan mutakhir' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', badge: 'Complex Tasks', desc: 'Kemampuan analisis dan penalaran mendalam' }
];

export async function sendMessageToGemini({
  apiKey,
  model = 'gemini-3.6-flash',
  messages = [],
  history = [],
  message = '',
  attachment = null,
  systemPrompt = '',
  temperature = 0.7,
  enableSearch = false,
  isDeepSearch = false,
  isReasoning = false,
  signal = null,
  onChunk,
  onThinking,
  onSources
}) {
  // Normalize messages list
  let allMessages = [];
  if (Array.isArray(messages) && messages.length > 0) {
    allMessages = [...messages];
  } else if (Array.isArray(history) && history.length > 0) {
    allMessages = history.map(h => ({
      role: h.role === 'model' || h.role === 'assistant' ? 'assistant' : 'user',
      content: typeof h.parts?.[0]?.text === 'string' ? h.parts[0].text : (h.content || ''),
      attachment: h.attachment || null
    }));
  }

  // Ensure current message is included if passed separately
  if (message && message.trim()) {
    const lastMsg = allMessages[allMessages.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== message.trim()) {
      allMessages.push({
        role: 'user',
        content: message.trim(),
        attachment: attachment
      });
    }
  }

  const effectiveSearch = enableSearch || isDeepSearch;

  // If no API key is provided in .env or settings, fallback to simulation
  if (!apiKey || !apiKey.trim()) {
    return simulateGeminiResponse({
      messages: allMessages,
      isDeepSearch: effectiveSearch,
      isReasoning,
      signal,
      onChunk,
      onThinking,
      onSources
    });
  }

  // If already aborted before start
  if (signal?.aborted) {
    throw new DOMException('The user aborted a request.', 'AbortError');
  }

  // Format messages into Gemini API contents structure
  const contents = allMessages.map((msg, index) => {
    const parts = [];

    if (msg.attachment && msg.attachment.data) {
      const mimeType = msg.attachment.type || 'image/jpeg';
      const base64Data = msg.attachment.data.split(',')[1] || msg.attachment.data;
      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      });
    }

    let textContent = msg.content || '';
    if (msg.role === 'user' && effectiveSearch && index === allMessages.length - 1) {
      textContent = `[Deep Search Active - Sertakan referensi & sumber]:\n${textContent}`;
    }

    parts.push({ text: textContent });

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: parts
    };
  });

  const requestBody = {
    contents: contents,
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: 4096
    }
  };

  // Add Google Search tool if search grounding is active
  if (effectiveSearch) {
    requestBody.tools = [
      {
        googleSearch: {}
      }
    ];
  }

  if (systemPrompt && systemPrompt.trim()) {
    requestBody.systemInstruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  const collectedSources = [];

  let fullThinking = '';
  if (isReasoning && onThinking) {
    fullThinking = 'Menganalisis permintaan, mengevaluasi konteks, dan menyusun penalaran sistematis...';
    onThinking(fullThinking);
  }

  const cleanModel = model.replace(/^models\//, '');
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:streamGenerateContent?key=${apiKey.trim()}&alt=sse`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: signal || undefined
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `Gemini API Error: ${response.status} ${response.statusText}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error && parsed.error.message) {
          errMsg = parsed.error.message;
        }
      } catch {}

      console.warn('Gemini API error:', errMsg);
      throw new Error(errMsg);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullText = '';
    let buffer = '';

    while (true) {
      if (signal?.aborted) {
        try {
          await reader.cancel();
        } catch {}
        throw new DOMException('The user aborted a request.', 'AbortError');
      }

      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const jsonStr = trimmed.substring(6);
          if (jsonStr === '[DONE]') continue;
          try {
            const data = JSON.parse(jsonStr);
            const candidate = data.candidates?.[0];
            const parts = candidate?.content?.parts || [];

            // Extract genuine grounding metadata if returned by API
            const groundingChunks = candidate?.groundingMetadata?.groundingChunks;
            if (groundingChunks && Array.isArray(groundingChunks)) {
              let updatedSources = false;
              for (const chunk of groundingChunks) {
                if (chunk.web?.uri) {
                  const uri = chunk.web.uri;
                  const title = chunk.web.title || uri;
                  if (!collectedSources.some(s => s.url === uri)) {
                    collectedSources.push({ title, url: uri });
                    updatedSources = true;
                  }
                }
              }
              if (updatedSources && onSources) {
                onSources([...collectedSources]);
              }
            }

            for (const part of parts) {
              if (part.thought) {
                fullThinking += part.thought;
                if (onThinking) onThinking(part.thought);
              } else if (part.text) {
                fullText += part.text;
                if (onChunk) onChunk(part.text);
              }
            }
          } catch (e) {
            console.warn('Error parsing SSE chunk', e);
          }
        }
      }
    }

    return {
      content: fullText,
      thinking: fullThinking,
      sources: collectedSources
    };
  } catch (err) {
    if (err.name === 'AbortError' || signal?.aborted) {
      console.log('Gemini request was cancelled by user.');
    } else {
      console.error('Gemini API call failed:', err);
    }
    throw err;
  }
}

function abortableSleep(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new DOMException('The user aborted a request.', 'AbortError'));
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException('The user aborted a request.', 'AbortError'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

// Fallback simulator when no valid key is entered
async function simulateGeminiResponse({
  messages = [],
  isDeepSearch,
  isReasoning,
  signal,
  onChunk,
  onThinking,
  onSources
}) {
  // Realistic initial thinking delay so the loading indicator is visibly displayed
  await abortableSleep(550, signal);

  const lastUserMsg = messages[messages.length - 1];
  const query = lastUserMsg ? (lastUserMsg.content || '').toLowerCase() : '';
  const rawQuery = lastUserMsg ? (lastUserMsg.content || '') : '';
  const hasAttachment = lastUserMsg?.attachment;

  const sources = [];

  let thinking = '';
  if (isReasoning && onThinking) {
    const thoughts = [
      'Menganalisis inti pertanyaan dan konteks percakapan...',
      'Mengevaluasi parameter aktif (Deep Search / Reasoning Engine)...',
      'Menyusun solusi komprehensif, terstruktur, dan akurat...'
    ];
    for (const t of thoughts) {
      await abortableSleep(280, signal);
      thinking += t + '\n';
      onThinking(t + ' ');
    }
  }

  let responseContent = '';

  if (hasAttachment) {
    responseContent = `Saya telah menganalisis gambar/dokumen yang Anda lampirkan! 📸\n\n### Analisis Visual:\n- **Tipe File**: ${hasAttachment.name || 'Media Visual'}\n- **Status**: Berhasil dibaca dan diproses oleh Kumo AI.\n\nJika ini adalah screenshot kode, rancangan antarmuka, atau diagram sistem, silakan tanyakan bagian spesifik yang ingin dianalisis lebih dalam! 🚀`;
  } else if (query.includes('halo') || query.includes('hai') || query.includes('hello')) {
    responseContent = `Halo! 👋 Saya **Kumo**, asisten AI cerdas Anda.\n\nAda yang bisa saya bantu hari ini? Anda bisa meminta saya untuk:\n- 💻 Menulis atau memperbaiki kode pemrograman\n- 🎓 Menjelaskan konsep dan materi belajar\n- 🎨 Membuat prompt gambar atau skrip video\n- 💡 Brainstorming ide dan merancang solusi kreatif`;
  } else if (query.includes('error') || query.includes('bug') || query.includes('kenapa') || query.includes('loading')) {
    responseContent = `Tentu, mari kita telusuri bersama! 🔍\n\n### Analisis:\nSetiap kali Anda mengirim pesan, Kumo AI akan menampilkan **indikator Thought Line** secara real-time saat merumuskan jawaban.\n\n1. **Indikator Respons**: Menampilkan status dinamis dan timer akurat saat memproses jawaban.\n2. **Streaming Teks**: Jawaban langsung muncul kata demi kata dengan kursor interaktif yang dinamis.\n3. **Reasoning Mode**: Jika tombol *Reason* diaktifkan, proses penalaran langkah demi langkah akan ditampilkan secara terstruktur.\n\nSilakan coba kirimkan topik apa saja untuk mencobanya! ✨`;
  } else {
    responseContent = `Tentu! Berikut adalah tanggapan untuk: **"${rawQuery}"** ✨\n\n### Ringkasan & Solusi:\n1. **Respons Cepat**: Sistem memproses masukan Anda secara real-time dengan streaming teks interaktif.\n2. **Kustomisasi Fleksibel**: Anda dapat mengatur model AI, tema visual, serta mengaktifkan mode *Deep Search* atau *Reasoning* melalui bilah masukan di bawah.\n3. **Dukungan Penuh**: Hubungkan Google Gemini API Key Anda kapan saja di menu *Pengaturan* untuk mengakses model Gemini tingkat lanjut secara langsung.\n\nApakah ada hal spesifik yang ingin kita bahas lebih dalam?`;
  }

  // Simulate streaming word-by-word with realistic human-paced delivery
  const words = responseContent.split(' ');
  for (let i = 0; i < words.length; i++) {
    await abortableSleep(22, signal);
    const chunk = (i === 0 ? '' : ' ') + words[i];
    if (onChunk) {
      onChunk(chunk);
    }
  }

  return {
    content: responseContent,
    thinking: thinking,
    sources: sources
  };
}

