export const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getMagnitudeColor = (mag) => {
  if (!mag) return '#52c41a';
  if (mag > 5) return '#ff4d4f';
  if (mag > 3) return '#faad14';
  return '#52c41a';
};
