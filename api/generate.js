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
      doorDesc = `CRITICAL RULE - DO NOT TOUCH THE DOOR AREA: The entrance door is located at ${doorInfo.pct}% from the left edge (${doorInfo.hPos}). You must NEVER place any person, body part, shadow, or any element in front of or overlapping the entrance door area. The door must remain completely visible and unobstructed exactly as in the original photo. `;
    }

    let queueDesc = '';
    if (queueInfo) {
      queueDesc = `Place ALL people concentrated around ${queueInfo.pct}% from the left edge (${queueInfo.hPos}) along the building wall. `;
    } else {
      queueDesc = 'Place people along the building wall beside the door. ';
    }

    const prompt = `Realistic photo edit. ONLY add people. Do NOT change the background whatsoever. ${doorDesc}${queueDesc}Add a crowd of Korean young adults gathered outside this store waiting to enter. People stand in small tight groups of 2 to 4 people. Each group huddles together in a loose circle or cluster, facing each other and chatting, while gradually oriented toward the entrance. Groups packed closely together forming one continuous dense crowd. People hold phones, bags, drinks. Relaxed natural body language. No rigid poses. CRITICAL: People must be realistically scaled to match the perspective and depth of the scene. People further from the camera must appear smaller. People must look like they are standing ON the ground, not floating. Their feet must touch the ground naturally. No person should appear larger than the building elements around them. All Korean young adults, varied outfits, hairstyles, heights. Lighting and shadows must match the original photo exactly. Faces blurred.`;

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
