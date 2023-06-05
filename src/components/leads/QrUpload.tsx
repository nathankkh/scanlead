import { useState } from 'react';
import { uploadFile } from '../../firebase-setup/firebase-functions';
import QrScanner from 'qr-scanner';

function qrUpload() {
  const [file, setFile] = useState(null);
  const fsCollectionName = 'testing'; // the name of the colletion in firestore

  async function scan(image: File) {
    const result = await QrScanner.scanImage(image);
    console.log(result);
  }

  const handleFileInput = (e) => {
    const inputFile = e.target.files[0];
    // TODO: handle cancellation of upload

    // Upload file if it is an image
    if (inputFile.type.match('image.*')) {
      // Check if file is an image
      setFile(inputFile);
      console.log(inputFile.type);
      console.log(file);
      uploadFile(inputFile, fsCollectionName);
      scan(inputFile);
    } else {
      alert('not an image');
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

export default qrUpload;
