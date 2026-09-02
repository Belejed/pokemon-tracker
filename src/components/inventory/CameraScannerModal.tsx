import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  SwitchCamera, 
  Upload, 
  Loader2, 
  Search
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTracker } from '../../context/TrackerContext';
import { ocrService, OCRScanResult } from '../../services/ocrService';
import { tcgdexService } from '../../services/tcgdexService';
import { TCGdexCardSummary } from '../../types/tcgdex';

export const CameraScannerModal: React.FC = () => {
  const { isScannerModalOpen, closeScannerModal, saveInventoryItem } = useTracker();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasCamera, setHasCamera] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  
  const [, setOcrResult] = useState<OCRScanResult | null>(null);
  const [matchedCards, setMatchedCards] = useState<TCGdexCardSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Start / Stop Camera Stream
  useEffect(() => {
    if (isScannerModalOpen) {
      startCamera();
    } else {
      stopCamera();
      setOcrResult(null);
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
          width: { ideal: 1280 },
          height: { ideal: 720 },
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
  const processImage = async (imageSource: HTMLCanvasElement | Blob | string) => {
    setIsProcessing(true);
    setStatusMessage('Memindai teks pada kartu dengan OCR...');
    setMatchedCards([]);

    try {
      const ocr = await ocrService.scanCardImage(imageSource);
      setOcrResult(ocr);

      const queryTerm = ocr.extractedName || '';
      setSearchQuery(queryTerm);

      if (queryTerm && queryTerm.length >= 2) {
        setStatusMessage(`Mencari kartu "${queryTerm}" di database Pokémon Indonesia...`);
        const results = await tcgdexService.searchCards(queryTerm);
        setMatchedCards(results.slice(0, 10));
        if (results.length > 0) {
          setStatusMessage(`Ditemukan ${results.length} kartu yang cocok!`);
        } else {
          setStatusMessage(`Tidak ditemukan kecocokan untuk "${queryTerm}". Coba cari manual di bawah.`);
        }
      } else {
        setStatusMessage('Teks kartu tidak terbaca jelas. Silakan masukkan nama kartu secara manual.');
      }
    } catch (err: any) {
      console.error('Scan processing failed:', err);
      setStatusMessage('Gagal memproses gambar kartu.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture frame from video feed
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    processImage(canvas);
  };

  // Handle local image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processImage(event.target.result as string);
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

  // Select card and save to Inventory
  const handleSelectCard = async (cardSummary: TCGdexCardSummary) => {
    setIsProcessing(true);
    setStatusMessage(`Mengambil info lengkap kartu ${cardSummary.name}...`);
    try {
      const detail = await tcgdexService.getCardDetail(cardSummary.id);
      const cardName = detail?.name || cardSummary.name;
      const setName = detail?.set?.name || '';
      const localId = detail?.localId || cardSummary.localId || '';
      const rarity = detail?.rarity ? tcgdexService.mapRarity(detail.rarity) : '';
      const imgUrl = detail?.image 
        ? tcgdexService.getHighResImageUrl(detail.image, 'high') 
        : cardSummary.image 
        ? tcgdexService.getHighResImageUrl(cardSummary.image, 'high') 
        : '';

      await saveInventoryItem({
        name: cardName,
        set: setName,
        localId: localId,
        rarity: rarity,
        category: 'Card',
        status: 'Kept',
        buy: 0,
        market: 0,
        source: 'Scan Kamera',
        imgUrl: imgUrl,
        tcgdexId: cardSummary.id
      });

      alert(`✅ Berhasil menambahkan "${cardName}" ke Katalog Koleksi! Silakan edit harga beli / pasar jika perlu.`);
      closeScannerModal();
    } catch (err: any) {
      alert(`Gagal menambahkan kartu: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
        {/* Hidden Canvas and File Input */}
        <canvas ref={canvasRef} className="hidden" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        {/* Camera Viewport & Overlay */}
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center border border-slate-800 shadow-inner">
          {hasCamera ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Card Framing Guide Overlay */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="w-52 h-72 border-2 border-dashed border-yellow-400/90 rounded-2xl relative shadow-[0_0_0_9999px_rgba(15,23,42,0.55)] flex flex-col justify-between p-2.5">
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-t-2 border-l-2 border-yellow-400"></span>
                    <span className="w-4 h-4 border-t-2 border-r-2 border-yellow-400"></span>
                  </div>
                  <div className="text-center">
                    <span className="bg-yellow-400/90 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow">
                      Arahkan Kartu ke Sini
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="w-4 h-4 border-b-2 border-l-2 border-yellow-400"></span>
                    <span className="w-4 h-4 border-b-2 border-r-2 border-yellow-400"></span>
                  </div>
                </div>
              </div>

              {/* Floating Camera Controls */}
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="bg-slate-900/80 text-white p-2 rounded-full backdrop-blur-sm hover:bg-slate-800 transition"
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
                Kamu tetap bisa mengunggah foto kartu dari galeri/file kamu.
              </p>
            </div>
          )}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center text-white p-4 text-center z-20">
              <Loader2 className="w-9 h-9 text-yellow-400 animate-spin mb-3" />
              <p className="text-sm font-bold">{statusMessage || 'Sedang memproses...'}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {hasCamera && (
            <button
              type="button"
              onClick={captureFrame}
              disabled={isProcessing}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <Camera className="w-4 h-4" />
              <span>Ambil Foto & Scan Kartu</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
            title="Upload Foto Kartu"
          >
            <Upload className="w-4 h-4" />
            <span className={hasCamera ? 'hidden sm:inline' : 'inline'}>Upload Foto</span>
          </button>
        </div>

        {/* OCR Result & Search Bar */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Hasil Deteksi / Cari Manual:</span>
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
              placeholder="Ketik nama kartu (contoh: Pikachu, Charizard...)"
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

        {/* Matched TCGdex Cards List */}
        {matchedCards.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Pilih Kartu yang Cocok:</span>
              <span className="text-[10px] text-slate-400">1-Klik Tambah ke Katalog</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
              {matchedCards.map(card => (
                <div
                  key={card.id}
                  onClick={() => handleSelectCard(card)}
                  className="bg-white border border-slate-200 hover:border-purple-400 p-2.5 rounded-xl flex items-center gap-3 cursor-pointer hover:shadow-md transition group"
                >
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
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-purple-700">
                      {card.name}
                    </p>
                    <p className="text-[10px] text-slate-400">ID: {card.id}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                      + Tambahkan
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
