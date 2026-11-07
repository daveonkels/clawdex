export interface Illustration {
  src: string;
  alt: string;
  caption: string;
}

export const invoiceComparison: Illustration = {
  src: '/images/plates/comparison-trial.webp',
  alt: 'Two lobster agents read the same invoice. Both report $48. Agent A includes a link to page 2.',
  caption: 'Both agents found the $48 total. Agent A also links to the page where you can check it.',
};

export const guideIllustrations: Partial<Record<string, Illustration>> = {
  hermes: {
    src: '/images/plates/hermes-memory.webp',
    alt: 'A lobster agent shows an 18°C forecast in a new chat after an earlier request to use Celsius.',
    caption: 'Tell each agent you use Celsius. Start a new chat and ask for the weather. Which one remembers?',
  },
  openfang: {
    src: '/images/plates/openfang-sources.webp',
    alt: 'A lobster agent points from a report citation to the corresponding passage in the documentation.',
    caption: 'Before scheduling a report, open its source links. Does each one support the claim beside it?',
  },
  'secure-openclaw': {
    src: '/images/plates/secure-openclaw-draft.webp',
    alt: 'A lobster agent types a draft reply beneath a meeting invitation in a phone chat.',
    caption: 'Give each agent a sample invitation. Check the date and time in its draft before you send it.',
  },
};
