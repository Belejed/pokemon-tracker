import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Upload, 
  Loader2, 
  Search, 
  ExternalLink, 
  Plus, 
  Sparkles
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTracker } from '../../context/TrackerContext';
import { useAuth } from '../../context/AuthContext';
import { ocrService } from '../../services/ocrService';
import { tcgdexService } from '../../services/tcgdexService';
import { TCGdexCardSummary } from '../../types/tcgdex';
import { getTokopediaSearchUrl, getShopeeSearchUrl } from '../../utils/ecommerce';

export const CameraScannerModal: React.FC = () => {
  const { isScannerModalOpen, closeScannerModal, saveInventoryItem } = useTracker();
  const { isAdmin } = useAuth();

  const videoContainerRef = useRef<HTMLDivElement | null>(null);
  const cardFrameRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const [detectedTitle, setDetectedTitle] = useState<string>('');
  const [capturedPhotoUrl, setCapturedPhotoUrl] = useState<string | null>(null);
  const [matchedCards, setMatchedCards] = useState<TCGdexCardSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Start / Stop Camera Stream
  useEffect(() => {
    if (isScannerModalOpen) {
      startCamera();
    } else {
      stopCamera();
      setDetectedTitle('');
      setCapturedPhotoUrl(null);
      setMatchedCards([]);
      setStatusMessage('');
      setSearchQuery('');
    }
    return () => {
      stopCamera();
    };
  }, [isScannerModalOpen, facingMode]);

  const startCamera = async () => {
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
        },
        audio: false,
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setHasCamera(true);
    } catch (err) {
      console.warn('Camera access unavailable or denied:', err);
      setHasCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Perform Card Recognition on image
  const processCapturedCard = async (
    fullCardCanvas: HTMLCanvasElement, 
    titleZoneCanvas?: HTMLCanvasElement
  ) => {
    setIsProcessing(true);
    setStatusMessage('Memindai judul kartu Pokémon...');
    setMatchedCards([]);

    try {
      // Pass 1: Try reading title zone first (crispest, no body text interference)
      let ocr = titleZoneCanvas ? await ocrService.scanCardImage(titleZoneCanvas) : null;
      let title = ocr?.cleanedName || '';

      // Pass 2: If title zone was blank or noisy, try reading full card
      if (!title || title.length < 3) {
        setStatusMessage('Menganalisis teks penuh kartu...');
        ocr = await ocrService.scanCardImage(fullCardCanvas);
        title = ocr.cleanedName || '';
      }

      setDetectedTitle(title);
      setSearchQuery(title);

      if (title && title.length >= 2) {
        setStatusMessage(`Mencocokkan "${title}" dengan database Pokémon Indonesia...`);
        
        // Search by tokens / words
        const words = title.split(' ').filter(w => w.length >= 3);
        let results: TCGdexCardSummary[] = [];

        for (const word of words) {
          const res = await tcgdexService.searchCards(word);
          if (res.length > 0) {
            results = [...results, ...res];
          }
        }

        // De-duplicate results
        const uniqueMap = new Map<string, TCGdexCardSummary>();
        results.forEach(r => uniqueMap.set(r.id, r));
        const uniqueResults = Array.from(uniqueMap.values());

        setMatchedCards(uniqueResults.slice(0, 8));
        if (uniqueResults.length > 0) {
          setStatusMessage(`Ditemukan ${uniqueResults.length} kartu yang mirip di database.`);
        } else {
          setStatusMessage(`Judul terdeteksi: "${title}". Kamu bisa langsung cek harga pasar di Tokopedia & Shopee di bawah!`);
        }
      } else {
        setStatusMessage('Teks kartu kurang jelas. Silakan masukkan nama kartu secara manual di bawah.');
      }
    } catch (err: any) {
      console.error('Scan processing failed:', err);
      setStatusMessage('Gagal memproses gambar kartu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Crop exact card area from video viewport using bounding box
  const captureFrame = () => {
    if (!videoRef.current || !videoContainerRef.current || !cardFrameRef.current) return;
    const video = videoRef.current;
    const container = videoContainerRef.current;
    const frame = cardFrameRef.current;

    const videoW = video.videoWidth || 1280;
    const videoH = video.videoHeight || 720;

    const containerRect = container.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();

    // Calculate normalized frame position on the displayed video container
    const relX = Math.max(0, (frameRect.left - containerRect.left) / containerRect.width);
    const relY = Math.max(0, (frameRect.top - containerRect.top) / containerRect.height);
    const relW = Math.min(1, frameRect.width / containerRect.width);
    const relH = Math.min(1, frameRect.height / containerRect.height);

    // Source pixel crop coordinates on the actual high-res video stream
    const cropX = Math.floor(relX * videoW);
    const cropY = Math.floor(relY * videoH);
    const cropW = Math.floor(relW * videoW);
    const cropH = Math.floor(relH * videoH);

    // 1. Full Card Canvas
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = cropW;
    cardCanvas.height = cropH;
    const cardCtx = cardCanvas.getContext('2d');
    if (!cardCtx) return;
    cardCtx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

    // Store captured photo
    const photoDataUrl = cardCanvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhotoUrl(photoDataUrl);

    // 2. Title Zone Canvas (Top 26% of the card where Pokémon & Trainer titles are printed)
    const titleCanvas = document.createElement('canvas');
    const titleH = Math.floor(cropH * 0.26);
    titleCanvas.width = cropW;
    titleCanvas.height = titleH;
    const titleCtx = titleCanvas.getContext('2d');
    if (titleCtx) {
      titleCtx.drawImage(cardCanvas, 0, 0, cropW, titleH, 0, 0, cropW, titleH);
    }

    processCapturedCard(cardCanvas, titleCanvas);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              setCapturedPhotoUrl(canvas.toDataURL('image/jpeg', 0.88));

              // Title zone
              const titleCanvas = document.createElement('canvas');
              const titleH = Math.floor(img.height * 0.25);
              titleCanvas.width = img.width;
              titleCanvas.height = titleH;
              const titleCtx = titleCanvas.getContext('2d');
              if (titleCtx) {
                titleCtx.drawImage(img, 0, 0, img.width, titleH, 0, 0, img.width, titleH);
              }
              processCapturedCard(canvas, titleCanvas);
            }
          };
          img.src = event.target.result as string;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Manual search trigger
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsProcessing(true);
    setStatusMessage(`Mencari "${searchQuery}"...`);
    setDetectedTitle(searchQuery.trim());
    try {
      const results = await tcgdexService.searchCards(searchQuery);
      setMatchedCards(results.slice(0, 10));
      setStatusMessage(`Ditemukan ${results.length} kartu.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Add custom detected card or selected TCGdex card to Inventory
  const handleSaveToInventory = async (customName?: string, tcgCard?: TCGdexCardSummary) => {
    if (!isAdmin) return;
    const finalName = customName || detectedTitle || searchQuery;
    if (!finalName) {
      alert('Nama kartu belum terisi.');
      return;
    }

    setIsProcessing(true);
    setStatusMessage(`Menyimpan "${finalName}" ke inventaris...`);
    try {
      let setName = '';
      let localId = '';
      let rarity = '';
      let imgUrl = capturedPhotoUrl || '';

      if (tcgCard) {
        const detail = await tcgdexService.getCardDetail(tcgCard.id);
        if (detail?.set?.name) setName = detail.set.name;
        if (detail?.localId) localId = detail.localId;
        if (detail?.rarity) rarity = tcgdexService.mapRarity(detail.rarity);
        if (detail?.image) imgUrl = tcgdexService.getHighResImageUrl(detail.image, 'high');
      }

      await saveInventoryItem({
        name: finalName,
        set: setName,
        localId: localId,
        rarity: rarity,
        category: 'Card',
        status: 'Kept',
        buy: 0,
        market: 0,
        source: 'Scan Kamera',
        imgUrl: imgUrl,
        tcgdexId: tcgCard?.id
      });

      alert(`✅ Berhasil menambahkan "${finalName}" ke Inventaris!`);
      closeScannerModal();
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeQueryName = detectedTitle || searchQuery;
  const currentTokopediaUrl = activeQueryName ? getTokopediaSearchUrl(activeQueryName) : '';
  const currentShopeeUrl = activeQueryName ? getShopeeSearchUrl(activeQueryName) : '';

  return (
    <Modal
      isOpen={isScannerModalOpen}
      onClose={closeScannerModal}
      maxWidth="max-w-xl"
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <span>Scan Kartu Pokémon (Kamera OCR)</span>
        </div>
      }
    >
      <div className="space-y-4 pt-1">
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Camera Viewport & Overlay */}
        <div 
          ref={videoContainerRef}
          className="relative bg-slate-950 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner"
        >
          {hasCamera ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Precise Card Framing Guide Overlay (2.5 : 3.5 Pokémon Aspect Ratio) */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
                <div 
                  ref={cardFrameRef}
                  className="w-56 sm:w-64 h-80 sm:h-92 border-2 border-dashed border-yellow-400 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] flex flex-col justify-between p-3"
                >
                  {/* Top Guide Corners & Title Label */}
                  <div className="flex justify-between items-start">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-yellow-400"></span>
                    <span className="bg-yellow-400 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
                      Posisikan Judul Kartu di Sini
                    </span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-yellow-400"></span>
                  </div>

                  {/* Center Hint */}
                  <div className="text-center">
                    <span className="bg-slate-900/85 text-yellow-300 font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm border border-yellow-400/40">
                      Pas-kan Kartu ke Bingkai
                    </span>
                  </div>

                  {/* Bottom Guide Corners */}
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-yellow-400"></span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-yellow-400"></span>
                  </div>
                </div>
              </div>

              {/* Floating Camera Flip Button */}
              <div className="absolute top-3 right-3 flex gap-2 z-10">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="bg-slate-900/80 text-white p-2 rounded-full backdrop-blur-sm hover:bg-slate-800 transition shadow"
                  title="Ganti Kamera"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="text-center p-6 text-slate-400">
              <Camera className="w-12 h-12 mx-auto mb-2 text-slate-600" />
              <p className="text-sm font-semibold text-slate-300">Kamera tidak dapat diakses</p>
              <p className="text-xs text-slate-500 mt-1">
                Kamu bisa langsung mengunggah foto kartu dari galeri.
              </p>
            </div>
          )}

          {/* Processing Spinner Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center z-20 animate-in fade-in">
              <Loader2 className="w-9 h-9 text-yellow-400 animate-spin mb-3" />
              <p className="text-sm font-bold text-yellow-300">{statusMessage || 'Sedang memindai...'}</p>
            </div>
          )}
        </div>

        {/* Capture & Upload Buttons */}
        <div className="flex items-center gap-2">
          {hasCamera && (
            <button
              type="button"
              onClick={captureFrame}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-red-500 hover:from-purple-700 hover:to-indigo-700 text-white py-3 rounded-xl font-black text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto & Scan Judul Kartu</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            title="Upload Foto Kartu"
          >
            <Upload className="w-4 h-4" />
            <span className={hasCamera ? 'hidden sm:inline' : 'inline'}>Upload Foto</span>
          </button>
        </div>

        {/* Detected Card Spotlight & Live E-Commerce Links */}
        {activeQueryName && (
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 p-3.5 sm:p-4 rounded-2xl border border-purple-200 shadow-sm space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              {capturedPhotoUrl ? (
                <img
                  src={capturedPhotoUrl}
                  alt="Hasil Scan"
                  className="w-14 h-20 object-cover rounded-xl border border-purple-200 shadow-sm flex-shrink-0 bg-white"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-purple-200 text-purple-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  🎴
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-600" />
                  <span>Judul Kartu Terdeteksi:</span>
                </div>
                <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight mt-0.5 truncate">
                  {activeQueryName}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  Bandingkan harga real-time di marketplace Indonesia:
                </p>
              </div>
            </div>

            {/* Live E-Commerce Search Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={currentTokopediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-emerald-500 hover:text-white text-emerald-700 border border-emerald-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm group"
              >
                <span>Tokopedia</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>

              <a
                href={currentShopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-orange-500 hover:text-white text-orange-600 border border-orange-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-sm group"
              >
                <span>Shopee</span>
                <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

            {/* Admin Quick Add Button */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleSaveToInventory(activeQueryName)}
                disabled={isProcessing}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-yellow-400" />
                <span>Simpan "{activeQueryName}" ke Inventaris Saya</span>
              </button>
            )}
          </div>
        )}

        {/* Manual Edit Search Box */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Edit Nama / Cari Manual:</span>
            </span>
            {statusMessage && !isProcessing && (
              <span className="text-[10px] text-purple-700 font-semibold">{statusMessage}</span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              placeholder="Ketik nama kartu jika ingin mengedit..."
              className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-500"
            />
            <button
              type="button"
              onClick={handleManualSearch}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1"
            >
              Cari
            </button>
          </div>
        </div>

        {/* Database Match Suggestions from TCGdex */}
        {matchedCards.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Saran Database Pokémon Indonesia:</span>
              <span className="text-[10px] text-slate-400">Pilih untuk detail resmi</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {matchedCards.map(card => (
                <div
                  key={card.id}
                  className="bg-white border border-slate-200 hover:border-purple-300 p-2.5 rounded-xl flex items-center justify-between gap-2 shadow-sm transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {card.image ? (
                      <img
                        src={`${card.image}/low.webp`}
                        alt={card.name}
                        className="w-10 h-14 object-contain rounded bg-slate-50 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-14 bg-slate-100 rounded flex items-center justify-center text-slate-400 text-base flex-shrink-0">
                        🎴
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{card.name}</p>
                      <p className="text-[10px] text-slate-400">ID: {card.id}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => handleSaveToInventory(card.name, card)}
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold p-1.5 rounded-lg transition flex items-center gap-0.5 flex-shrink-0"
                      title="Pilih & Simpan"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Pilih</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
