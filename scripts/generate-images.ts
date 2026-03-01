/**
 * Generate OG images for editorial pages using fal.ai
 *
 * Usage:
 *   FAL_KEY=your_key npm run generate-images
 *
 * Generates:
 *   - public/images/og-analysis.jpg (1200x630)
 *   - public/images/og-faq.jpg (1200x630)
 */

import { fal } from '@fal-ai/client';
import fs from 'node:fs';
import path from 'node:path';

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images');

const images = [
  {
    name: 'og-analysis',
    prompt:
      'Deep ocean floor scene with bioluminescent creatures and glowing teal coral, multiple interconnected neural networks floating like jellyfish, dark navy background with subtle grid overlay, data visualization aesthetic, cinematic lighting, 8k quality, no text',
  },
  {
    name: 'og-faq',
    prompt:
      'Underwater cave with bioluminescent question mark shapes formed by glowing teal plankton, deep ocean blue background, soft volumetric lighting, mysterious and inviting atmosphere, cinematic quality, no text',
  },
];

async function generate() {
  if (!process.env.FAL_KEY) {
    console.error('FAL_KEY environment variable is required');
    process.exit(1);
  }

  fal.config({ credentials: process.env.FAL_KEY });

  for (const img of images) {
    console.log(`Generating ${img.name}...`);

    const result = await fal.subscribe('fal-ai/flux/schnell', {
      input: {
        prompt: img.prompt,
        image_size: { width: 1200, height: 630 },
        num_images: 1,
      },
    });

    const imageUrl = (result.data as any).images?.[0]?.url;
    if (!imageUrl) {
      console.error(`No image URL returned for ${img.name}`);
      continue;
    }

    const response = await fetch(imageUrl);
    const buffer = Buffer.from(await response.arrayBuffer());
    const outPath = path.join(OUTPUT_DIR, `${img.name}.jpg`);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved ${outPath}`);
  }

  console.log('Done!');
}

generate().catch(console.error);
