import QrScanner from 'qr-scanner';
import { useState, useEffect, useRef } from 'react';

function QrVideoNimiq() {
  const [cameraActive, setCameraActive] = useState(false);
  const [qrScanner, setQrScanner] = useState<QrScanner>(); // stores qr scanner
  const [hasScanned, setHasScanned] = useState(false);
  const videoRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    // initialise qr scanner
    const video = videoRef.current;
    const scanner = new QrScanner(
      video,
      (result) => {
        handleScan(result);
      },
      { facingMode: 'environment', highlightScanRegion: true }
    );
    setQrScanner(scanner);
  }, []);

  useEffect(() => {
    // toggles QR scanner on/off
    if (cameraActive) {
      qrScanner?.start();
    } else {
      qrScanner?.stop();
    }
  }, [cameraActive, qrScanner]);

  function handleScan(result: QrScanner.ScanResult) {
    resultRef.current.innerHTML = result.data;
    setCameraActive(false);
    setHasScanned(true);
  }

  return (
    <>
      <button onClick={() => setCameraActive(true)}>Scan a QR code</button>
      <div
        id="videoContainer"
        style={{ display: cameraActive ? 'block' : 'none' }}
      >
        <video ref={videoRef} id="qr-video" width={'250px'} height={'250px'} />
      </div>
      <div
        id="resultContainer"
        style={{ display: hasScanned ? 'block' : 'none' }}
      >
        <div ref={resultRef} />
      </div>
    </>
  );
}

export default QrVideoNimiq;
