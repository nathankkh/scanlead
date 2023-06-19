import QrScanner from 'qr-scanner';
import { useState, useEffect, useRef } from 'react';
import ResultContainer from './results/ResultContainer';

function QrVideo() {
  const [qrScanner, setQrScanner] = useState<QrScanner>(); // stores the QrScanner
  const [cameraActive, setCameraActive] = useState(false); // used to toggle
  const [hasScanned, setHasScanned] = useState(false);
  const [qrResult, setQrResult] = useState<string>(); // stores result from scanner
  const videoRef = useRef(null);

  useEffect(() => {
    // REFACTOR: Run on app initialisation instead of on component mount
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
    console.log('initialised qr scanner');
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
    setQrResult(result.data);
    setCameraActive(false);
    setHasScanned(true);
  }

  return (
    <>
      <button onClick={() => setCameraActive(true)}>Scan a QR code</button> {/* TODO: add cancel */}
      <div id="videoContainer" style={{ display: cameraActive ? 'block' : 'none' }}>
        <video ref={videoRef} id="qr-video" width={'250px'} height={'250px'} />
      </div>
      <br></br>
      {qrResult}
      <br />
      {hasScanned && <ResultContainer result={qrResult} />}
    </>
  );
}

export default QrVideo;
