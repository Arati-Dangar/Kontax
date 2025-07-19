import {useScanDetails} from '../services/useScanDetails';
import {Alert} from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const toCSV = data => {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'LinkedIn',
    'Designation',
    'Organization',
    'Location',
    'Intent',
    'Your Intent',
    'Tags',
    'Notes',
    'Date',
  ];
  const rows = data.map(item =>
    [
      item.firstName,
      item.lastName,
      item.email,
      item.phone,
      item.linkedln,
      item.designation,
      item.organization,
      item.location,
      item.intent,
      item.yourIntent,
      Array.isArray(item.tags) ? item.tags.join(', ') : '',
      item.notes,
      item.date,
    ]
      .map(field => `"${field || ''}"`)
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
};

const toVCards = data => {
  return data
    .map(item => {
      return `
BEGIN:VCARD
VERSION:3.0
N:${item.lastName || ''};${item.firstName || ''};;;
FN:${item.firstName || ''} ${item.lastName || ''}
EMAIL:${item.email || ''}
TEL:${item.phone || ''}
ORG:${item.organization || ''}
TITLE:${item.designation || ''}
NOTE:${item.notes || ''}
URL:${item.linkedln || ''}
ADR:;;${item.location || ''};;;;
CATEGORIES:${Array.isArray(item.tags) ? item.tags.join(',') : ''}
END:VCARD
`.trim();
    })
    .join('\n');
};

export const exportSingleVCard = async vcard => {
  const vcf = `
BEGIN:VCARD
VERSION:3.0
N:${vcard.lastName || ''};${vcard.firstName || ''};;;
FN:${vcard.firstName || ''} ${vcard.lastName || ''}
EMAIL:${vcard.email || ''}
TEL:${vcard.phone || ''}
ORG:${vcard.organization || ''}
TITLE:${vcard.designation || ''}
NOTE:${vcard.notes || ''}
URL:${vcard.linkedln || ''}
ADR:;;${vcard.location || ''};;;;
CATEGORIES:${Array.isArray(vcard.tags) ? vcard.tags.join(',') : ''}
END:VCARD
`.trim();

  const fileName = `${vcard.firstName || 'contact'}_${Date.now()}.vcf`;
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  try {
    await RNFS.writeFile(path, vcf, 'utf8');
    await Share.open({
      url: `file://${path}`,
      type: 'text/x-vcard',
      title: `Export vCard`,
    });
  } catch (err) {
    console.error('vCard export error:', err);
    Alert.alert('Export Failed', 'Could not export vCard.');
  }
};

export const exportSingleCSV = async vcard => {
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Phone',
    'LinkedIn',
    'Designation',
    'Organization',
    'Location',
    'Intent',
    'Your Intent',
    'Tags',
    'Notes',
    'Date',
  ];
  const row = [
    vcard.firstName,
    vcard.lastName,
    vcard.email,
    vcard.phone,
    vcard.linkedln,
    vcard.designation,
    vcard.organization,
    vcard.location,
    vcard.intent,
    vcard.yourIntent,
    Array.isArray(vcard.tags) ? vcard.tags.join(', ') : '',
    vcard.notes,
    vcard.date,
  ]
    .map(field => `"${field || ''}"`)
    .join(',');

  const csvContent = `${headers.join(',')}\n${row}`;
  const fileName = `${vcard.firstName || 'contact'}_${Date.now()}.csv`;
  const path = `${RNFS.DocumentDirectoryPath}/${fileName}`;

  try {
    await RNFS.writeFile(path, csvContent, 'utf8');
    await Share.open({
      url: `file://${path}`,
      type: 'text/csv',
      title: `Export CSV`,
    });
  } catch (err) {
    console.error('CSV export error:', err);
    Alert.alert('Export Failed', 'Could not export CSV.');
  }
};
