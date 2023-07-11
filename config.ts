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
  },
  modalStyles: {
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.75)'
    },
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: 'rgba(255, 255, 255, 255)',
      borderRadius: '10px',
    }
  }
};

export default config;
