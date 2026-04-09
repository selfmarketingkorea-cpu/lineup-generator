export const config = { api: { bodyParser: { sizeLimit: '10mb' } } };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const { image, mimeType, doorInfo, queueInfo } = req.body;
    const apiKey = process.env.OPENAI_API_KEY;

    let doorDesc = '';
    if (doorInfo) {
      doorDesc = `The entrance door is at ${doorInfo.pct}% from the left (${doorInfo.hPos}). Keep this area COMPLETELY EMPTY — no people, no body parts, no shadows anywhere near the door. `;
    }

    let queueDesc = '';
    if (queueInfo) {
      queueDesc = `Place ALL people around ${queueInfo.pct}% from the left (${queueInfo.hPos}) along the building wall. `;
    } else {
      queueDesc = 'Place people along the building wall beside the door. ';
    }

    const prompt = `Realistic photo edit. ONLY add people. Do NOT change the background. Do NOT alter colors, lighting, or any part of the original scene. ${doorDesc}${queueDesc}Add Korean young adults waiting outside in small groups of 2 to 4 people. Each group huddles together facing each other and chatting, oriented toward the entrance. Groups packed closely together. People hold phones, bags. Relaxed natural poses. People must be realistically scaled to the scene — match the perspective exactly, people further away appear smaller. Feet must touch the ground naturally. All Korean young adults, varied outfits and hairstyles. Lighting matches original exactly. Faces blurred.`;

    const imageBuffer = Buffer.from(image, 'base64');
    const blob = new Blob([imageBuffer], { type: mimeType || 'image/jpeg' });
    const file = new File([blob], 'image.jpg', { type: mimeType || 'image/jpeg' });

    const formData = new FormData();
    formData.append('model', 'gpt-image-1');
    formData.append('prompt', prompt);
    formData.append('image', file);
    formData.append('n', '1');
    formData.append('size', '1024x1024');

    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      body: formData
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error?.message || 'OpenAI API error');

    const imageData = result.data[0].b64_json;
    res.status(200).json({ image: imageData, mimeType: 'image/png' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
