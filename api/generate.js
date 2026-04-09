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
      doorDesc = `The entrance door is at ${doorInfo.pct}% from the left edge (${doorInfo.hPos}). Keep this area COMPLETELY EMPTY — no people, no body parts, no shadows near the door.\n`;
    }
    let queueDesc = '';
    if (queueInfo) {
      queueDesc = `Place ALL people around ${queueInfo.pct}% from the left (${queueInfo.hPos}) along the building wall.\n`;
    }

    const prompt = `Realistic photo edit.
ONLY add people.
Do NOT change the background.
${doorDesc}${queueDesc}A queue of Korean young adults waiting outside a storefront.
The queue follows closely along the glass window side of the building, clearly attached to the window.
The entrance door area is completely separate and must remain empty.
There is a clear visible gap in front of the entrance, with no people near it.
The queue forms a continuous flow along the window toward the entrance.
The queue is NOT a strict single-file line.
It has slight width because people gather in small groups.
People gather in small clusters of 2 to 4 people.
Within each cluster, people form compact rounded shapes:
small semi-circles, slight arcs, or loose circular groupings.
They are NOT aligned in a straight line.
People in each cluster face inward toward each other,
forming a tight conversational group.
Each cluster appears as a small dense group blob, not a line.
These clusters connect very closely to each other,
almost touching, forming a dense and crowded queue.
The overall queue must feel tightly packed and busy,
with minimal empty space between people and groups.
In every cluster, at least one person stands directly next to the glass window, physically aligned with it.
Clusters must stay attached to the window and must not drift away.
The person at the very front of the queue must be looking toward the entrance door.
This front person must NEVER stand directly in front of the entrance.
There must always be a clear empty gap between this person and the door.
People are arranged with natural depth.
Within each cluster some people stand slightly forward, some slightly behind.
Bodies partially overlap but not completely.
No flat, paper-like alignment.
All people must match the exact lighting of the original scene.
Light direction, brightness, contrast, and color temperature must be identical.
People must have the same shadow direction and intensity as the environment.
They must blend naturally into the scene.
All people are physically very close to each other.
No one stands apart or isolated.
People naturally overlap objects and do not avoid them.
All people are Korean young adults with natural Korean proportions.
Everyone looks different: different clothing, colors, silhouettes, and hairstyles.
Footwear is varied: dark sneakers, boots, loafers, sandals.
Most shoes are dark or neutral tones, not white.
No repeated identical shoes.
People are NOT standing straight or uniformly.
They have relaxed, natural poses: leaning, turning, facing each other,
with varied body angles and no uniform alignment.
Avoid straight-line alignment inside groups.
Faces are blurred and not recognizable.
Small text remains unreadable.`;

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
