import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Camera, SwitchCamera, FlashlightOff, Flashlight, Image as ImageIcon } from 'lucide-react';

export default function CameraScanner({ onCapture, onClose, onBarcodeDetected }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    const [isReady, setIsReady] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const [flashEnabled, setFlashEnabled] = useState(false);
    const [scannerActive, setScannerActive] = useState(true);
    const [detectedCode, setDetectedCode] = useState(null);
    const [scanBox, setScanBox] = useState(null);

    // Start camera
    const startCamera = useCallback(async () => {
        try {
            // Stop any existing stream
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }

            const constraints = {
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setIsReady(true);
                };
            }
        } catch (err) {
            console.error('Camera error:', err);
        }
    }, [facingMode]);

    useEffect(() => {
        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [startCamera]);

    // Toggle flash
    const toggleFlash = async () => {
        if (streamRef.current) {
            const track = streamRef.current.getVideoTracks()[0];
            if (track.getCapabilities && track.getCapabilities().torch) {
                await track.applyConstraints({
                    advanced: [{ torch: !flashEnabled }]
                });
                setFlashEnabled(!flashEnabled);
            }
        }
    };

    // Switch camera
    const switchCamera = () => {
        setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    };

    // Capture photo
    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Set canvas size to video size
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Get base64 image
        const imageData = canvas.toDataURL('image/jpeg', 0.9);

        // Stop camera
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        onCapture(imageData);
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                // Stop camera
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                }
                onCapture(ev.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Scanning animation effect
    useEffect(() => {
        if (!scannerActive || !isReady) return;

        // Create scanning box animation
        const interval = setInterval(() => {
            // Simulate detection box moving (in real app, this would track actual detected objects)
            const boxSize = 120 + Math.random() * 40;
            const centerX = 50;
            const centerY = 50;

            setScanBox({
                x: centerX - boxSize / 2 * 0.1 + Math.random() * 2 - 1,
                y: centerY - boxSize / 2 * 0.1 + Math.random() * 2 - 1,
                width: boxSize,
                height: boxSize
            });
        }, 100);

        return () => clearInterval(interval);
    }, [scannerActive, isReady]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: '#000',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px',
                    paddingTop: 'calc(16px + env(safe-area-inset-top))',
                    zIndex: 10,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)'
                }}
            >
                <motion.button
                    onClick={onClose}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    <X size={24} />
                </motion.button>

                <h3 style={{ color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '18px' }}>
                    Scan Food
                </h3>

                <motion.button
                    onClick={toggleFlash}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        background: flashEnabled ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: flashEnabled ? '#000' : '#fff',
                        cursor: 'pointer'
                    }}
                >
                    {flashEnabled ? <Flashlight size={20} /> : <FlashlightOff size={20} />}
                </motion.button>
            </motion.div>

            {/* Camera Viewfinder */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                    }}
                />

                {/* Scanning Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {/* Scanning Frame */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        style={{
                            width: '75%',
                            aspectRatio: '1',
                            maxWidth: '300px',
                            position: 'relative'
                        }}
                    >
                        {/* Corner brackets */}
                        {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(corner => (
                            <motion.div
                                key={corner}
                                animate={{
                                    boxShadow: ['0 0 20px rgba(0,255,135,0.3)', '0 0 40px rgba(0,255,135,0.6)', '0 0 20px rgba(0,255,135,0.3)']
                                }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{
                                    position: 'absolute',
                                    width: '40px',
                                    height: '40px',
                                    ...(corner.includes('top') ? { top: 0 } : { bottom: 0 }),
                                    ...(corner.includes('left') ? { left: 0 } : { right: 0 }),
                                    borderColor: 'var(--accent-primary)',
                                    borderStyle: 'solid',
                                    borderWidth: 0,
                                    ...(corner === 'top-left' && { borderTopWidth: '4px', borderLeftWidth: '4px', borderTopLeftRadius: '16px' }),
                                    ...(corner === 'top-right' && { borderTopWidth: '4px', borderRightWidth: '4px', borderTopRightRadius: '16px' }),
                                    ...(corner === 'bottom-left' && { borderBottomWidth: '4px', borderLeftWidth: '4px', borderBottomLeftRadius: '16px' }),
                                    ...(corner === 'bottom-right' && { borderBottomWidth: '4px', borderRightWidth: '4px', borderBottomRightRadius: '16px' }),
                                }}
                            />
                        ))}

                        {/* Scanning Line */}
                        <motion.div
                            animate={{ top: ['0%', '100%', '0%'] }}
                            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                            style={{
                                position: 'absolute',
                                left: '5%',
                                right: '5%',
                                height: '2px',
                                background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
                                boxShadow: '0 0 20px var(--accent-primary), 0 0 40px var(--accent-primary)'
                            }}
                        />

                        {/* Detection Box (tracks object) */}
                        <AnimatePresence>
                            {scanBox && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        position: 'absolute',
                                        left: `${scanBox.x}%`,
                                        top: `${scanBox.y}%`,
                                        width: scanBox.width,
                                        height: scanBox.height,
                                        border: '2px solid rgba(0, 255, 135, 0.5)',
                                        borderRadius: '8px',
                                        pointerEvents: 'none'
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Hint Text */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        position: 'absolute',
                        bottom: 140,
                        left: 0,
                        right: 0,
                        textAlign: 'center',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '14px',
                        fontWeight: 500,
                        textShadow: '0 2px 8px rgba(0,0,0,0.5)'
                    }}
                >
                    Point camera at food or barcode
                </motion.div>
            </div>

            {/* Bottom Controls */}
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    display: 'flex',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    padding: '24px',
                    paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
                }}
            >
                {/* Gallery Button */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                />
                <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    whileTap={{ scale: 0.9 }}
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    <ImageIcon size={22} />
                </motion.button>

                {/* Capture Button */}
                <motion.button
                    onClick={capturePhoto}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent-primary), #00CC6A)',
                        border: '4px solid rgba(255,255,255,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#000',
                        cursor: 'pointer',
                        boxShadow: '0 0 40px rgba(0, 255, 135, 0.5)'
                    }}
                >
                    <Zap size={32} />
                </motion.button>

                {/* Switch Camera Button */}
                <motion.button
                    onClick={switchCamera}
                    whileTap={{ scale: 0.9, rotate: 180 }}
                    style={{
                        width: 50,
                        height: 50,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        cursor: 'pointer'
                    }}
                >
                    <SwitchCamera size={22} />
                </motion.button>
            </motion.div>

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </motion.div>
    );
}
