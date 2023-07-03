const config = {
  lookupCollection: 'eventbrite', // EB collection name
  lookupField: 'id',
  imageCollection: 'testing',
  imageCloudStore: '',
  leadFields: {
    id: '',
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    experience: '',
    fieldOfInterest: '',
    leadType: '', // [hot, warm, cold]
    comments: ''
    //timestamp: undefined
  },
  scannerOptions: {
    facingMode: 'environment',
    highlightScanRegion: true
  }
};

export default config;
