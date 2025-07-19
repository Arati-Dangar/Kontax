// export const getIntentStyle = (intent: string) => {
//   switch (intent.toLowerCase()) {
//     case 'Partnership':
//       return {backgroundColor: 'green'};
//     case 'Hiring':
//       return {backgroundColor: 'Blue'};
//     case 'Selling Product/Services':
//       return {backgroundColor: 'purple'};
//     case 'Exploring Market/Ideas':
//       return {backgroundColor: 'yellow'};

//     case 'networking':
//       return {backgroundColor: 'gray'};
//     default:
//       return {backgroundColor: 'brown'};
//   }
// };

const intentColors: Record<string, string> = {
  partnership: 'green',
  hiring: 'blue',
  'selling product/services': 'purple',
  'exploring market/ideas': 'yellow',
  networking: 'gray',
};

export const getIntentStyle = (intent: string) => {
  const color = intentColors[intent.toLowerCase()] || 'brown';
  return {backgroundColor: color};
};

export const synergyTags = [
  {label: 'Potential Hire', value: 'Potential Hire', color: '#d1fae5'},
  {label: 'Explore Later', value: 'Explore Later', color: '#fef9c3'},
  {label: 'Product Buyer', value: 'Product Buyer', color: 'purple'},
  {label: 'Product Employee', value: 'Product Employee', color: 'brown'},
  {label: 'Product Seller', value: 'Product Seller', color: 'orange'},
  {label: 'Collaborator', value: 'Collaborator', color: 'yellow'},
  {label: 'Follow-up Required', value: 'Follow-up Required', color: 'blue'},
  {label: 'Not Relevent Now', value: 'Not Relevent Now', color: '#fef9c3'},
  {label: 'No Match', value: 'No Match', color: 'red'},
  {label: 'Custom Tag', value: 'Custom Tag', color: ''},
];

export const getTagsPreview = tags => {
  if (typeof tags === 'string') {
    return tags.split(',').map(tag => tag.trim());
  }
  return Array.isArray(tags) ? tags : [];
};

export const getIntentMatchScore = (theirIntent, yourIntent) => {
  const highMatchPairs = [
    ['Partnership', 'Collaborator'],
    ['Hiring', 'Potential Employer'],
    ['Selling', 'Product Buyer'],
  ];

  if (!theirIntent || !yourIntent) return null;

  for (const [a, b] of highMatchPairs) {
    if (
      (theirIntent === a && yourIntent === b) ||
      (theirIntent === b && yourIntent === a)
    ) {
      return 'High Match';
    }
  }

  if (theirIntent === 'Exploring' || yourIntent === 'Exploring') {
    return 'Partial Match';
  }

  return null;
};
