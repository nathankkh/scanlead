const config = {
  lookupCollection: 'eventbrite', // EB collection name
  lookupField: 'id',
  imageCollection: 'testing',
  imageCloudStore: '',
  leadCollection: 'leads', // collection storing all leads. May be removed in lieu of using userAuth as a collection name
  leadFields: {
    id: '',
    name: '',
    email: '',
    background: '',
    temperature: '',
    comments: ''
  }
};

export default config;
