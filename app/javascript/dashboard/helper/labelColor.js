const LABEL_COLORS = [
  '#6A6A6A',
  '#466832',
  '#987901',
  '#0D50BA',
  '#287571',
  '#170E7E',
  '#235E37',
  '#87090D',
];

export const getRandomColor = () =>
  LABEL_COLORS[Math.floor(Math.random() * LABEL_COLORS.length)];
