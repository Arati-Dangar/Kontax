export const getIntentStyle = (intent: string) => {
  switch (intent.toLowerCase()) {
    case 'business':
      return {backgroundColor: 'yellow'};
    case 'personal':
      return {backgroundColor: 'pink'};
    case 'networking':
      return {backgroundColor: 'green'};
    case 'partnership':
      return {backgroundColor: 'blue'};

    case 'exploration':
      return {backgroundColor: 'orange'};
    default:
      return {backgroundColor: 'purple'};
  }
};

export const synergyTags = [
  {label: 'Potential Hire', value: 'Potential Hire', color: '#d1fae5'},
  {label: 'Explore Later', value: 'Explore Later', color: '#fef9c3'},
  {label: 'Follow-up Required', value: 'Follow-up Required', color: '#fee2e2'},
];

export const getTagsPreview = tags => {
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim());
  }
  return Array.isArray(tags) ? tags : [];
};
