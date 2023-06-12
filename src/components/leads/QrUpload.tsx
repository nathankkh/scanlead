import { useState } from 'react';
import { uploadFile } from '../../firebase-setup/firebase-functions';
import QrScanner from 'qr-scanner';
import config from '../../../config.ts';

function QrUpload() {
  const [file, setFile] = useState(null);
  const fsCollectionName = config.imageCollection; // FIXME: remove this line and modify the reference to it below

  async function scan(image: File) {
    const result = await QrScanner.scanImage(image);
    console.log('QrCode result:' + result);
  }

  const handleFileInput = (e) => {
    const inputFile = e.target.files[0];
    // TODO: handle cancellation of upload

    // Upload file if it is an image
    if (inputFile.type.match('image.*')) {
      // Check if file is an image
      setFile(inputFile);
      console.log('File type: ' + inputFile.type);
      console.log('FileState ' + file);
      uploadFile(inputFile, fsCollectionName);
      scan(inputFile);
    } else {
      alert('not an image'); // TODO: replace with proper error handling
    }
  };

  return (
    <>
      <input
        type="file"
        accept="image/*"
        id="qrUpload"
        onChange={handleFileInput}
        capture="environment"
      />
    </>
  );
}

export default QrUpload;
