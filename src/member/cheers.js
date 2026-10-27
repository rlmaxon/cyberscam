// Preset cheers family members can send. Only these can be sent (no free text), so a
// cheer can never carry a link, a request for money, or anything unkind.
export const CHEERS = [
  { key: 'proud', emoji: '🌟', text: "I'm so proud of you!" },
  { key: 'keep-going', emoji: '💪', text: "Keep going, you're doing great!" },
  { key: 'badge', emoji: '🏅', text: 'Congratulations on your new badge!' },
  { key: 'thanks', emoji: '🙏', text: 'Thank you for learning this. It means a lot to me.' },
  { key: 'weekly', emoji: '📞', text: "Let's do the Scam of the Week together. I'll call you!" },
  { key: 'love', emoji: '❤️', text: 'Love you! Stay safe out there.' },
];

export const cheerText = (key) => CHEERS.find((c) => c.key === key) ?? { key, emoji: '👏', text: 'Sent you a cheer!' };

export const RELATIONSHIPS = ['Son', 'Daughter', 'Grandchild', 'Spouse or partner', 'Brother or sister', 'Niece or nephew', 'Friend', 'Caregiver', 'Other'];
