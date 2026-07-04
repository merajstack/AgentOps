'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Camera, User, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  saveFaceDescriptor,
  getFaceDescriptor,
  hasFaceData,
  euclideanDistance,
} from '@/lib/faceStore'

// Dynamically loaded to avoid SSR issues
let faceapi: typeof import('face-api.js') | null = null

const MODELS_URL = '/models'
const FACE_MATCH_THRESHOLD = 0.55

type AuthStatus =
  | 'idle'
  | 'sending'
  | 'otp_sent'
  | 'verifying'
  | 'success'
  | 'error'
  | 'invalid_otp'
  | 'loading_models'
  | 'face_setup'
  | 'face_capturing'
  | 'face_login'
  | 'face_verifying'

export default function AuthPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [status, setStatus] = useState<AuthStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [internalOtp, setInternalOtp] = useState<string | null>(null)
  const [resendTimer, setResendTimer] = useState(0)

  // Face UI state
  const [modelProgress, setModelProgress] = useState(0)
  const [faceDetected, setFaceDetected] = useState(false)
  const [faceMessage, setFaceMessage] = useState('')
  const [isFaceEnabledForUser, setIsFaceEnabledForUser] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const detectionLoopRef = useRef<number | null>(null)
  const faceDetectedRef = useRef(false)

  // ─── Camera helpers ─────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      streamRef.current = mediaStream
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
    } catch {
      setStatus('error')
      setErrorMessage('Camera access denied. Please allow camera access and try again.')
    }
  }

  const stopCamera = useCallback(() => {
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current)
      detectionLoopRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  // ─── OTP timer ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (resendTimer <= 0) return
    const interval = setInterval(() => setResendTimer((p) => p - 1), 1000)
    return () => clearInterval(interval)
  }, [resendTimer])

  // ─── Check if returning user has face data ─────────────────────────────────
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setIsFaceEnabledForUser(false)
      return
    }
    hasFaceData(email).then(setIsFaceEnabledForUser)
  }, [email])

  // ─── Load face-api.js models with progress ─────────────────────────────────
  const loadModels = async (): Promise<boolean> => {
    setStatus('loading_models')
    setModelProgress(0)
    try {
      // Dynamically import to avoid SSR
      faceapi = await import('face-api.js')

      const steps = [
        {
          label: 'Loading face detector…',
          fn: () => faceapi!.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
          progress: 33,
        },
        {
          label: 'Loading landmark model…',
          fn: () => faceapi!.nets.faceLandmark68Net.loadFromUri(MODELS_URL),
          progress: 66,
        },
        {
          label: 'Loading recognition model…',
          fn: () => faceapi!.nets.faceRecognitionNet.loadFromUri(MODELS_URL),
          progress: 100,
        },
      ]

      for (const step of steps) {
        await step.fn()
        setModelProgress(step.progress)
        await new Promise((r) => setTimeout(r, 200)) // short pause to render progress
      }
      setModelsLoaded(true)
      return true
    } catch (err) {
      setStatus('error')
      setErrorMessage('Failed to load face detection models. Please refresh and try again.')
      return false
    }
  }

  // ─── Continuous face detection loop ────────────────────────────────────────
  const startDetectionLoop = useCallback((onFaceFound?: (descriptor: Float32Array) => void) => {
    if (!faceapi || !videoRef.current) return

    const detect = async () => {
      if (!videoRef.current || !faceapi) return
      if (videoRef.current.readyState < 2) {
        detectionLoopRef.current = requestAnimationFrame(detect)
        return
      }

      try {
        const detection = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          )
          .withFaceLandmarks()
          .withFaceDescriptor()

        if (detection) {
          faceDetectedRef.current = true
          setFaceDetected(true)
          setFaceMessage('✅ Face detected! Hold still…')

          // Draw bounding box overlay
          if (canvasRef.current && videoRef.current) {
            const displaySize = {
              width: videoRef.current.videoWidth,
              height: videoRef.current.videoHeight,
            }
            faceapi.matchDimensions(canvasRef.current, displaySize)
            const resized = faceapi.resizeResults(detection, displaySize)
            const ctx = canvasRef.current.getContext('2d')
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
              faceapi.draw.drawDetections(canvasRef.current, resized)
            }
          }

          if (onFaceFound) {
            // Stop loop and pass descriptor back
            onFaceFound(detection.descriptor)
            return
          }
        } else {
          faceDetectedRef.current = false
          setFaceDetected(false)
          setFaceMessage('⚠️ Face not visible. Adjust your camera or lighting and increase screen brightness.')

          // Clear canvas
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d')
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
          }
        }
      } catch {
        // detection frame error, keep looping
      }

      detectionLoopRef.current = requestAnimationFrame(detect)
    }

    detectionLoopRef.current = requestAnimationFrame(detect)
  }, [])

  // ─── OTP Flow ────────────────────────────────────────────────────────────────
  const handleGetOtp = async () => {
    if (!name.trim()) { setStatus('error'); setErrorMessage('Name is required.'); return }
    if (!email.includes('@') || !email.includes('.')) {
      setStatus('error'); setErrorMessage('Please enter a valid email address.'); return
    }
    setStatus('sending'); setErrorMessage(''); setOtp('')
    try {
      const webhookUrl = process.env.NEXT_PUBLIC_MAIN_OTP_WEBHOOK_URL || 'https://workflow.ccbp.in/webhook/main-otp'
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, timestamp: new Date().toISOString() }),
      })
      if (!response.ok) throw new Error(`Failed with status: ${response.status}`)
      const contentType = response.headers.get('content-type')
      let receivedOtp = ''
      if (contentType?.includes('application/json')) {
        const data = await response.json()
        receivedOtp = String(data.otp || data.code || data)
      } else {
        receivedOtp = await response.text()
      }
      setInternalOtp(receivedOtp.trim())
      setStatus('otp_sent')
      setResendTimer(60)
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Something went wrong while sending OTP.')
    }
  }

  const completeLogin = async (loginEmail: string, loginName: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({ email: loginEmail.trim(), name: loginName.trim() }, { onConflict: 'email' })
        .select()
        .single()
      if (error) throw error
      setStatus('success')
      localStorage.setItem(
        'agentops_user',
        JSON.stringify({ id: data.id, name: loginName.trim(), email: loginEmail.trim() })
      )
      setTimeout(() => router.push('/'), 1500)
    } catch (err: any) {
      setStatus('error')
      setErrorMessage(err.message || 'Failed to save user data.')
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) { setStatus('error'); setErrorMessage('Please enter the OTP.'); return }
    setStatus('verifying')
    await new Promise((r) => setTimeout(r, 800))
    if (otp === internalOtp) {
      if (!isFaceEnabledForUser) {
        // Offer face setup after first OTP success
        await initiateFaceSetup()
      } else {
        await completeLogin(email, name)
      }
    } else {
      setStatus('invalid_otp')
      setErrorMessage('Invalid OTP. Please click "Resend OTP" to try again.')
    }
  }

  // ─── Face Setup (Register) ───────────────────────────────────────────────────
  const initiateFaceSetup = async () => {
    const loaded = modelsLoaded ? true : await loadModels()
    if (!loaded) return

    setStatus('face_setup')
    setFaceDetected(false)
    setFaceMessage('')
    await startCamera()

    // Wait for video to be ready then start loop
    setTimeout(() => {
      startDetectionLoop()
    }, 1000)
  }

  const handleCaptureFace = async () => {
    if (!faceapi || !videoRef.current) return
    setStatus('face_capturing')

    // Stop current loop, do one precise detection
    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current)
      detectionLoopRef.current = null
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setFaceMessage('⚠️ Face not visible. Adjust your camera or lighting and increase screen brightness.')
        setStatus('face_setup')
        startDetectionLoop()
        return
      }

      // Save the 128-dim vector
      await saveFaceDescriptor(email, detection.descriptor)
      stopCamera()
      await completeLogin(email, name)
    } catch (err) {
      setStatus('error')
      setErrorMessage('Face capture failed. Please try again.')
    }
  }

  const handleSkipFaceSetup = async () => {
    stopCamera()
    await completeLogin(email, name)
  }

  // ─── Face Login (Verify) ─────────────────────────────────────────────────────
  const initiateFaceLogin = async () => {
    if (!email.includes('@')) {
      setStatus('error'); setErrorMessage('Please enter your email address first.'); return
    }
    const loaded = modelsLoaded ? true : await loadModels()
    if (!loaded) return

    setStatus('face_login')
    setFaceDetected(false)
    setFaceMessage('')
    await startCamera()

    // Start detection loop — as soon as a face is stably found, verify it
    setTimeout(() => {
      startDetectionLoop()
    }, 1000)
  }

  const handleVerifyFace = async () => {
    if (!faceapi || !videoRef.current) return
    setStatus('face_verifying')

    if (detectionLoopRef.current) {
      cancelAnimationFrame(detectionLoopRef.current)
      detectionLoopRef.current = null
    }

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detection) {
        setFaceMessage('⚠️ Face not visible. Adjust your camera or lighting and increase screen brightness.')
        setStatus('face_login')
        startDetectionLoop()
        return
      }

      const stored = await getFaceDescriptor(email)
      if (!stored) {
        setStatus('error')
        setErrorMessage('No face data found for this email. Please sign in with OTP.')
        stopCamera()
        return
      }

      const distance = euclideanDistance(detection.descriptor, stored)
      stopCamera()

      if (distance < FACE_MATCH_THRESHOLD) {
        const { data } = await supabase.from('users').select('name').eq('email', email).single()
        await completeLogin(email, data?.name || email.split('@')[0])
      } else {
        setStatus('error')
        setErrorMessage(`Face not recognized (distance: ${distance.toFixed(2)}). Please try again or use OTP.`)
      }
    } catch (err) {
      setStatus('error')
      setErrorMessage('Face verification failed. Please try again.')
    }
  }

  const handleCancelFaceView = () => {
    stopCamera()
    setStatus('idle')
    setFaceMessage('')
    setFaceDetected(false)
  }

  // ─── Derived booleans ────────────────────────────────────────────────────────
  const isFaceView = ['loading_models', 'face_setup', 'face_capturing', 'face_login', 'face_verifying'].includes(status)
  const isLoadingModels = status === 'loading_models'
  const isCapturing = status === 'face_capturing' || status === 'face_verifying'

  return (
    <div className="relative min-h-screen bg-black text-white flex flex-col justify-between overflow-x-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-950/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-950/20 blur-[120px] pointer-events-none" />

      <header className="px-6 md:px-12 lg:px-16 pt-6 relative z-10">
        <div className="liquid-glass rounded-xl px-4 py-2 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft size={16} /><span>Back to Home</span>
          </button>
          <span className="text-sm font-semibold tracking-wider text-cyan-400">AUTHENTICATION</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          <div className="liquid-glass border border-white/10 rounded-2xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">

            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-normal tracking-tight text-white mb-2">
                {status === 'face_setup' || status === 'face_capturing' ? 'Enable Face Login'
                  : status === 'face_login' || status === 'face_verifying' ? 'Face Verification'
                  : status === 'loading_models' ? 'Preparing AI Models'
                  : 'Welcome'}
              </h1>
              <p className="text-sm text-gray-400">
                {status === 'loading_models' ? 'Loading neural network models into browser…'
                  : status === 'face_setup' || status === 'face_capturing' ? 'Position your face clearly in the camera.'
                  : status === 'face_login' || status === 'face_verifying' ? 'We\'ll compare your face with your stored data.'
                  : 'Verify your identity to continue.'}
              </p>
            </div>

            {/* Status alerts */}
            {status === 'success' && (
              <div className="mb-6 flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-emerald-400 text-sm">
                <CheckCircle2 size={18} className="shrink-0" />
                <span>Verification successful! Redirecting…</span>
              </div>
            )}
            {(status === 'error' || status === 'invalid_otp') && (
              <div className="mb-6 flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-rose-400 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ─── MODEL LOADING PROGRESS ─────────────────────────────────── */}
            {isLoadingModels && (
              <div className="space-y-6">
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      {modelProgress < 33 ? 'Loading face detector…'
                        : modelProgress < 66 ? 'Loading landmark model…'
                        : modelProgress < 100 ? 'Loading recognition model…'
                        : '✅ Models ready!'}
                    </span>
                    <span className="text-cyan-400 font-bold">{modelProgress}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-700 ease-out"
                      style={{ width: `${modelProgress}%` }}
                    />
                  </div>

                  {/* Step dots */}
                  <div className="flex items-center justify-between px-1 mt-1">
                    {['Face Detector', 'Landmarks', 'Recognition'].map((label, i) => {
                      const threshold = (i + 1) * 33
                      const active = modelProgress >= threshold
                      return (
                        <div key={label} className="flex flex-col items-center gap-1">
                          <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${active ? 'bg-cyan-400 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)]' : 'bg-transparent border-white/20'}`} />
                          <span className={`text-[10px] ${active ? 'text-cyan-400' : 'text-gray-600'}`}>{label}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                  <Loader2 size={14} className="animate-spin text-cyan-500" />
                  <span>This only happens once per session</span>
                </div>
              </div>
            )}

            {/* ─── FACE CAMERA VIEW ─────────────────────────────────────────── */}
            {(status === 'face_setup' || status === 'face_capturing' || status === 'face_login' || status === 'face_verifying') && (
              <div className="space-y-4 flex flex-col items-center">

                {/* Camera feed with canvas overlay */}
                <div className="relative w-56 h-56 rounded-full overflow-hidden border-2 border-cyan-500/50 bg-black shadow-[0_0_24px_rgba(6,182,212,0.2)]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute inset-0 w-full h-full"
                    style={{ transform: 'scaleX(-1)' }}
                  />

                  {/* Face detected ring pulse */}
                  {faceDetected && (
                    <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-30 pointer-events-none" />
                  )}

                  {/* Scanning lines animation when verifying */}
                  {isCapturing && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute w-full h-0.5 bg-cyan-400/60 animate-bounce" />
                    </div>
                  )}
                </div>

                {/* Face status message */}
                {faceMessage && (
                  <p className={`text-sm text-center px-2 ${faceDetected ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {faceMessage}
                  </p>
                )}

                {/* Verifying spinner */}
                {isCapturing && (
                  <div className="flex items-center gap-2 text-cyan-400 text-sm">
                    <Loader2 size={16} className="animate-spin" />
                    <span>{status === 'face_verifying' ? 'Verifying biometrics…' : 'Capturing face vector…'}</span>
                  </div>
                )}

                {/* Action buttons */}
                {!isCapturing && (
                  <div className="w-full space-y-3">
                    {(status === 'face_setup') && (
                      <>
                        <button
                          onClick={handleCaptureFace}
                          disabled={!faceDetected}
                          className="w-full bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-black hover:bg-cyan-400 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <Camera size={18} />
                          {faceDetected ? 'Capture & Enable Face Login' : 'Waiting for face…'}
                        </button>
                        <button onClick={handleSkipFaceSetup} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl text-sm text-gray-400 transition-all">
                          Skip for now
                        </button>
                      </>
                    )}
                    {status === 'face_login' && (
                      <>
                        <button
                          onClick={handleVerifyFace}
                          disabled={!faceDetected}
                          className="w-full bg-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-black hover:bg-cyan-400 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                          <User size={18} />
                          {faceDetected ? 'Verify My Face' : 'Waiting for face…'}
                        </button>
                        <button onClick={handleCancelFaceView} className="w-full bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl text-sm text-gray-400 transition-all">
                          Use OTP instead
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ─── DEFAULT OTP / EMAIL FORM ─────────────────────────────────── */}
            {!isFaceView && status !== 'success' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    disabled={['sending','verifying','otp_sent','invalid_otp'].includes(status)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                  />
                </div>

                {!['otp_sent','invalid_otp','verifying'].includes(status) && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      disabled={['sending'].includes(status)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                    />
                  </div>
                )}

                {['otp_sent','verifying','invalid_otp'].includes(status) && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Enter OTP</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter the code sent to your email"
                      disabled={['verifying','invalid_otp'].includes(status)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                )}

                {/* Buttons */}
                {['idle','error','sending'].includes(status) && (
                  <div className="space-y-3">
                    <button
                      onClick={handleGetOtp}
                      disabled={status === 'sending'}
                      className="w-full bg-white text-black hover:bg-gray-100 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      {status === 'sending' ? <><Loader2 size={16} className="animate-spin" /> Sending OTP…</> : 'Sign In with OTP'}
                    </button>
                    {isFaceEnabledForUser && (
                      <button
                        onClick={initiateFaceLogin}
                        className="w-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        <Camera size={16} /> Sign In with Face
                      </button>
                    )}
                  </div>
                )}

                {['otp_sent','verifying','invalid_otp'].includes(status) && (
                  <div className="space-y-3">
                    <button
                      onClick={handleVerifyOtp}
                      disabled={['verifying','invalid_otp'].includes(status) || !otp}
                      className="w-full bg-white text-black py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    >
                      {status === 'verifying' ? <><Loader2 size={16} className="animate-spin" /> Verifying…</> : 'Verify OTP'}
                    </button>
                    <button
                      onClick={() => { if (resendTimer === 0) handleGetOtp() }}
                      disabled={resendTimer > 0 || status === 'verifying'}
                      className="w-full border border-white/20 text-white hover:bg-white/5 py-3.5 rounded-xl text-sm font-semibold disabled:opacity-50 transition-all"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-white/5 text-center text-xs text-gray-600 relative z-10">
        AgentOps © 2026. All rights reserved.
      </footer>
    </div>
  )
}
