import { useState } from 'react';
import { uploadFile } from '../../firebase-setup/firebase-functions';

function qrUpload() {
  const [file, setFile] = useState(null);
  const fsCollectionName = 'testing';

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
