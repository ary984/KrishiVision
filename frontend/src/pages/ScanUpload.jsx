import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { predictCropDisease } from '../api/client'
import { saveLocalScan } from '../utils/scanStorage'

export default function ScanUpload() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleFile = useCallback((file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, HEIC).')
      return
    }
    setError('')
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)
  }, [])

  const onFileChange = (e) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0])
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0])
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const onDragLeave = () => setIsDragging(false)

  const onAnalyze = async () => {
    if (!selectedFile || isAnalyzing) return
    setIsAnalyzing(true)
    setError('')
    try {
      const result = await predictCropDisease(selectedFile)
      saveLocalScan({
        ...result,
        id: result.id || `local-${Date.now()}`,
        filename: result.filename || selectedFile.name,
        image_url: result.image_url || preview,
        created_at: result.created_at || new Date().toISOString(),
      })
      navigate('/results', { state: { result, imageUrl: preview } })
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.')
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative bg-surface">
      {/* Decorative blurs */}
      <div className="fixed top-[-10%] right-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-96 h-96 bg-secondary/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

      <div className="flex-1 flex flex-col px-6 pt-10 pb-32 md:pt-16 md:pb-16 max-w-5xl mx-auto w-full">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
            New Analysis
          </h1>
          <p className="text-on-surface-variant text-lg">
            Upload a high-resolution photo of the affected plant area for AI diagnostic processing.
          </p>
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Upload Zone */}
          <div className="lg:col-span-7 flex flex-col gap-6 h-full">
            <div
              className={`rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center p-8 text-center transition-all duration-300 cursor-pointer min-h-[420px] h-full ${
                isDragging
                  ? 'border-primary bg-primary/5 shadow-xl'
                  : 'border-primary/20 bg-surface-container-highest hover:bg-white hover:shadow-xl'
              }`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              aria-label="Upload plant photo"
            >
              <div className="w-20 h-20 bg-primary-fixed rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-primary text-4xl">cloud_upload</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {isDragging ? 'Drop your image here' : 'Drag and drop plant photo'}
              </h3>
              <p className="text-on-surface-variant mb-8 max-w-xs mx-auto">
                Supports JPG, PNG and HEIC. For best results, use natural daylight.
              </p>
              <button
                type="button"
                className="bg-primary hover:opacity-90 text-white px-8 py-3 rounded-xl font-semibold transition-all"
                onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              >
                or Click to Upload
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>

            {/* Mobile Camera Option */}
            <div className="flex items-center gap-4 p-6 bg-surface-container-low rounded-2xl md:hidden">
              <div className="p-3 bg-secondary-container rounded-xl">
                <span className="material-symbols-outlined text-on-secondary-container">photo_camera</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-on-surface">Quick Capture</p>
                <p className="text-xs text-on-surface-variant">Use mobile camera for instant scan</p>
              </div>
              <button
                type="button"
                className="bg-surface-container-lowest text-primary font-bold px-4 py-2 rounded-lg text-sm border border-outline-variant/15"
                onClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.setAttribute('capture', 'environment')
                    fileInputRef.current.click()
                  }
                }}
              >
                Use Camera
              </button>
            </div>
          </div>

          {/* Preview & Status */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm flex flex-col min-h-[420px] h-full">
              <div className="p-6">
                <span className="text-stone-400 font-bold uppercase tracking-widest" style={{ fontSize: '10px', fontFamily: 'Manrope, sans-serif' }}>
                  Analysis Preview
                </span>
              </div>
              <div className="px-6 pb-6 relative flex-1">
                <div className="h-full min-h-[260px] bg-surface-container rounded-2xl overflow-hidden relative">
                  {preview ? (
                    <img src={preview} alt="Selected plant" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                      <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-outline-variant">image</span>
                        <p className="text-sm mt-2">No image selected</p>
                      </div>
                    </div>
                  )}
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4"></div>
                      <span className="text-white font-bold tracking-tight">AI Analyzing...</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="p-6 pt-0 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-on-surface-variant">Selected Image:</span>
                    <span className="text-sm font-bold text-on-surface truncate max-w-[140px]">{selectedFile.name}</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full rounded-full transition-all duration-500"></div>
                  </div>
                  <div className="flex justify-between items-center text-stone-400 uppercase tracking-tighter" style={{ fontSize: '11px' }}>
                    <span>Ready</span>
                    <span>100% loaded</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-error-container text-on-error-container px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}

            {/* Action */}
            <div className="mt-4">
              <button
                type="button"
                disabled={!selectedFile || isAnalyzing}
                onClick={onAnalyze}
                className={`w-full text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                  selectedFile && !isAnalyzing
                    ? 'bg-primary hover:opacity-90 hover:scale-[1.02] active:scale-95 cursor-pointer'
                    : 'bg-primary/40 cursor-not-allowed'
                }`}
                style={{ fontFamily: 'Manrope, sans-serif' }}
              >
                <span className="material-symbols-outlined">analytics</span>
                {isAnalyzing ? 'Analyzing...' : 'Analyze Crop'}
              </button>
              <p className="text-center mt-4 text-xs text-on-surface-variant">
                By submitting, you agree to our KrishiVision Data Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
