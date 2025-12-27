import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ImagePlus, Eye, EyeOff, Trash2, X, Check, Scale, Calendar, ChevronLeft, ChevronRight, Grid, Layers } from 'lucide-react';
import useStore from '../stores/useStore';

const PHOTO_TYPES = [
    { id: 'front', label: 'Front', icon: '🧍' },
    { id: 'side', label: 'Side', icon: '🧍‍♂️' },
    { id: 'back', label: 'Back', icon: '🔙' },
];

export default function ProgressGallery() {
    const {
        progressPhotos, progressPhotoPrivacy, profile,
        addProgressPhoto, deleteProgressPhoto, togglePhotoPrivacy
    } = useStore();

    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showCompareModal, setShowCompareModal] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [comparePhotos, setComparePhotos] = useState({ before: null, after: null });
    const [newPhoto, setNewPhoto] = useState({ imageData: null, type: 'front', weight: profile.weight || '', notes: '' });
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
    const fileInputRef = useRef(null);

    // Sort photos by date (newest first)
    const sortedPhotos = [...progressPhotos].sort((a, b) => new Date(b.date) - new Date(a.date));

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPhoto(prev => ({ ...prev, imageData: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePhoto = () => {
        if (newPhoto.imageData) {
            addProgressPhoto({
                imageData: newPhoto.imageData,
                type: newPhoto.type,
                weight: parseFloat(newPhoto.weight) || null,
                notes: newPhoto.notes
            });
            setNewPhoto({ imageData: null, type: 'front', weight: profile.weight || '', notes: '' });
            setShowUploadModal(false);
        }
    };

    const handlePhotoClick = (photo) => {
        if (progressPhotoPrivacy) {
            setSelectedPhoto(photo);
        } else {
            setSelectedPhoto(photo);
        }
    };

    const startCompare = () => {
        if (sortedPhotos.length >= 2) {
            setComparePhotos({
                before: sortedPhotos[sortedPhotos.length - 1],
                after: sortedPhotos[0]
            });
            setShowCompareModal(true);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="screen">
            {/* Header */}
            <motion.div
                className="screen-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-md">
                    <div className="icon-badge" style={{ width: 48, height: 48, background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
                        <Camera size={22} />
                    </div>
                    <div>
                        <h2>Progress Gallery</h2>
                        <p style={{ color: 'var(--text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                            Track your transformation
                        </p>
                    </div>
                </div>
                <motion.button
                    className="btn btn-ghost btn-icon"
                    onClick={togglePhotoPrivacy}
                    whileTap={{ scale: 0.9 }}
                    style={{ color: progressPhotoPrivacy ? 'var(--accent-warning)' : 'var(--accent-primary)' }}
                    title={progressPhotoPrivacy ? 'Photos hidden' : 'Photos visible'}
                >
                    {progressPhotoPrivacy ? <EyeOff size={22} /> : <Eye size={22} />}
                </motion.button>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                className="flex gap-md mb-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <motion.button
                    className="btn btn-primary flex-1"
                    onClick={() => setShowUploadModal(true)}
                    whileTap={{ scale: 0.98 }}
                >
                    <ImagePlus size={18} />
                    Add Photo
                </motion.button>
                {sortedPhotos.length >= 2 && (
                    <motion.button
                        className="btn btn-secondary"
                        onClick={startCompare}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Layers size={18} />
                        Compare
                    </motion.button>
                )}
            </motion.div>

            {/* Stats */}
            {sortedPhotos.length > 0 && (
                <motion.div
                    className="glass-card mb-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    style={{ padding: '16px' }}
                >
                    <div className="flex justify-between items-center">
                        <div>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Total Photos</p>
                            <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>{sortedPhotos.length}</p>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>First Photo</p>
                            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                {formatDate(sortedPhotos[sortedPhotos.length - 1]?.date)}
                            </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>Latest</p>
                            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                                {formatDate(sortedPhotos[0]?.date)}
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Photo Grid */}
            {sortedPhotos.length > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="flex justify-between items-center mb-md">
                        <h4>Your Photos</h4>
                        <div className="flex gap-sm">
                            <motion.button
                                className={`btn btn-ghost btn-icon`}
                                onClick={() => setViewMode('grid')}
                                style={{ color: viewMode === 'grid' ? 'var(--accent-primary)' : 'var(--text-tertiary)' }}
                            >
                                <Grid size={18} />
                            </motion.button>
                        </div>
                    </div>

                    <div className="grid gap-md" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        {sortedPhotos.map((photo, i) => (
                            <motion.div
                                key={photo.id}
                                className="glass-card"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                onClick={() => handlePhotoClick(photo)}
                                style={{
                                    aspectRatio: '3/4',
                                    padding: 0,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <img
                                    src={photo.imageData}
                                    alt={`Progress ${photo.type}`}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        filter: progressPhotoPrivacy ? 'blur(20px)' : 'none',
                                        transition: 'filter 0.3s'
                                    }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                                    padding: '24px 8px 8px',
                                    fontSize: 'var(--font-size-xs)'
                                }}>
                                    <p style={{ fontWeight: 600 }}>{formatDate(photo.date)}</p>
                                    {photo.weight && <p style={{ color: 'var(--accent-primary)' }}>{photo.weight} kg</p>}
                                </div>
                                {progressPhotoPrivacy && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'rgba(255,255,255,0.5)'
                                    }}>
                                        <EyeOff size={24} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    className="glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ textAlign: 'center', padding: '48px 24px' }}
                >
                    <div className="icon-badge" style={{ margin: '0 auto 20px', width: 72, height: 72, background: 'rgba(168, 85, 247, 0.15)', color: '#A855F7' }}>
                        <Camera size={32} />
                    </div>
                    <h3 style={{ marginBottom: '8px' }}>Start Your Journey</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
                        Take your first progress photo to track your transformation
                    </p>
                    <motion.button
                        className="btn btn-primary"
                        onClick={() => setShowUploadModal(true)}
                        whileTap={{ scale: 0.98 }}
                    >
                        <ImagePlus size={18} />
                        Take Photo
                    </motion.button>
                </motion.div>
            )}

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowUploadModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card glass-card-elevated modal-content"
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '360px' }}
                        >
                            <div className="flex justify-between items-center mb-lg">
                                <h3>Add Progress Photo</h3>
                                <button className="btn btn-ghost btn-icon" onClick={() => setShowUploadModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Photo Preview/Upload */}
                            <div
                                className="glass-card mb-lg"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    aspectRatio: '3/4',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    overflow: 'hidden',
                                    padding: 0
                                }}
                            >
                                {newPhoto.imageData ? (
                                    <img
                                        src={newPhoto.imageData}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
                                        <Camera size={40} style={{ marginBottom: '8px' }} />
                                        <p>Tap to upload</p>
                                    </div>
                                )}
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />

                            {/* Photo Type */}
                            <div className="mb-md">
                                <label className="input-label mb-sm">Photo Type</label>
                                <div className="flex gap-sm">
                                    {PHOTO_TYPES.map((type) => (
                                        <motion.button
                                            key={type.id}
                                            className={`glass-card flex-1`}
                                            onClick={() => setNewPhoto(prev => ({ ...prev, type: type.id }))}
                                            whileTap={{ scale: 0.95 }}
                                            style={{
                                                padding: '12px',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                border: newPhoto.type === type.id ? '2px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                                                background: newPhoto.type === type.id ? 'rgba(0, 255, 135, 0.1)' : 'var(--glass-bg)'
                                            }}
                                        >
                                            <span style={{ fontSize: '20px' }}>{type.icon}</span>
                                            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '4px' }}>{type.label}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Weight */}
                            <div className="input-group mb-md">
                                <label className="input-label flex items-center gap-sm">
                                    <Scale size={14} /> Weight (optional)
                                </label>
                                <input
                                    type="number"
                                    className="input"
                                    placeholder="e.g. 75"
                                    value={newPhoto.weight}
                                    onChange={(e) => setNewPhoto(prev => ({ ...prev, weight: e.target.value }))}
                                    step="0.1"
                                />
                            </div>

                            <motion.button
                                className="btn btn-primary btn-lg btn-full"
                                onClick={handleSavePhoto}
                                disabled={!newPhoto.imageData}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Check size={20} />
                                Save Photo
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Photo Detail Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setSelectedPhoto(null)}
                        style={{ background: 'rgba(0,0,0,0.95)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ maxWidth: '90%', maxHeight: '80vh' }}
                        >
                            <img
                                src={selectedPhoto.imageData}
                                alt="Progress"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '70vh',
                                    objectFit: 'contain',
                                    borderRadius: 'var(--radius-lg)'
                                }}
                            />
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <p style={{ fontWeight: 600 }}>{formatDate(selectedPhoto.date)}</p>
                                {selectedPhoto.weight && (
                                    <p style={{ color: 'var(--accent-primary)' }}>{selectedPhoto.weight} kg</p>
                                )}
                                <motion.button
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        deleteProgressPhoto(selectedPhoto.id);
                                        setSelectedPhoto(null);
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{ marginTop: '16px', color: 'var(--accent-warning)' }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Compare Modal */}
            <AnimatePresence>
                {showCompareModal && comparePhotos.before && comparePhotos.after && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowCompareModal(false)}
                        style={{ background: 'rgba(0,0,0,0.95)' }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: '95%', maxWidth: '600px' }}
                        >
                            <h3 style={{ textAlign: 'center', marginBottom: '16px' }}>Before & After</h3>
                            <div className="flex gap-md">
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>Before</p>
                                    <img
                                        src={comparePhotos.before.imageData}
                                        alt="Before"
                                        style={{
                                            width: '100%',
                                            aspectRatio: '3/4',
                                            objectFit: 'cover',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    />
                                    <p style={{ marginTop: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                        {formatDate(comparePhotos.before.date)}
                                    </p>
                                    {comparePhotos.before.weight && (
                                        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                                            {comparePhotos.before.weight} kg
                                        </p>
                                    )}
                                </div>
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)', marginBottom: '8px' }}>After</p>
                                    <img
                                        src={comparePhotos.after.imageData}
                                        alt="After"
                                        style={{
                                            width: '100%',
                                            aspectRatio: '3/4',
                                            objectFit: 'cover',
                                            borderRadius: 'var(--radius-md)'
                                        }}
                                    />
                                    <p style={{ marginTop: '8px', fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                                        {formatDate(comparePhotos.after.date)}
                                    </p>
                                    {comparePhotos.after.weight && (
                                        <p style={{ color: 'var(--accent-primary)', fontSize: 'var(--font-size-sm)' }}>
                                            {comparePhotos.after.weight} kg
                                        </p>
                                    )}
                                </div>
                            </div>
                            {comparePhotos.before.weight && comparePhotos.after.weight && (
                                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                                        Weight change:
                                        <span style={{
                                            color: comparePhotos.after.weight < comparePhotos.before.weight ? 'var(--accent-primary)' : 'var(--accent-warning)',
                                            fontWeight: 700,
                                            marginLeft: '8px'
                                        }}>
                                            {comparePhotos.after.weight - comparePhotos.before.weight > 0 ? '+' : ''}
                                            {(comparePhotos.after.weight - comparePhotos.before.weight).toFixed(1)} kg
                                        </span>
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
