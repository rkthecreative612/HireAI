import React, { useState, useEffect, useRef, useCallback, RefObject } from 'react';
import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { ProctorStatus, ProctorViolationType, ProctorEvent } from '../types';

interface UseFaceProctorOptions {
  isEnabled: boolean;
  maxStrikes?: number; // Total strikes before termination (default 4)
  onStrike?: (strikeCount: number, event: ProctorEvent) => void;
  onMaxStrikesReached?: (lastEvent: ProctorEvent, allEvents: ProctorEvent[]) => void;
  debounceViolationMs?: number; // Time violation must persist before triggering strike (default 2200ms)
  strikeCooldownMs?: number; // Time between strikes (default 6000ms)
}

const WASM_CDN_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';
const MODEL_ASSET_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

export function useFaceProctor(
  videoRef: RefObject<HTMLVideoElement | null>,
  options: UseFaceProctorOptions
) {
  const {
    isEnabled,
    maxStrikes = 4,
    onStrike,
    onMaxStrikesReached,
    debounceViolationMs = 2200,
    strikeCooldownMs = 6000,
  } = options;

  const [status, setStatus] = useState<ProctorStatus>('idle');
  const [activeViolation, setActiveViolation] = useState<ProctorViolationType | null>(null);
  const [strikes, setStrikes] = useState<number>(0);
  const [events, setEvents] = useState<ProctorEvent[]>([]);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastProcessedTimeRef = useRef<number>(0);
  
  // Debounce tracking
  const violationStartTimeRef = useRef<number | null>(null);
  const currentViolatingTypeRef = useRef<ProctorViolationType | null>(null);
  const lastStrikeTimeRef = useRef<number>(0);
  const currentStrikesRef = useRef<number>(0);

  currentStrikesRef.current = strikes;

  // Initialize MediaPipe FaceLandmarker
  useEffect(() => {
    let isMounted = true;

    async function initLandmarker() {
      if (!isEnabled) return;
      try {
        setStatus('loading_model');
        const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN_URL);
        
        if (!isMounted) return;

        const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: MODEL_ASSET_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 2, // Detect multiple faces
          outputFaceBlendshapes: false,
          outputFacialTransformationMatrixes: false,
        });

        if (!isMounted) {
          landmarker.close();
          return;
        }

        landmarkerRef.current = landmarker;
        setStatus('ready');
      } catch (err: any) {
        console.warn('FaceLandmarker GPU init error, falling back to CPU:', err);
        try {
          const filesetResolver = await FilesetResolver.forVisionTasks(WASM_CDN_URL);
          if (!isMounted) return;
          const fallbackLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath: MODEL_ASSET_URL,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numFaces: 2,
          });
          if (!isMounted) {
            fallbackLandmarker.close();
            return;
          }
          landmarkerRef.current = fallbackLandmarker;
          setStatus('ready');
        } catch (cpuErr: any) {
          console.error('Failed to load FaceLandmarker on CPU:', cpuErr);
          if (isMounted) {
            setCameraError('AI proctor model could not be loaded. Please check network connection.');
            setStatus('camera_error');
          }
        }
      }
    }

    if (isEnabled && !landmarkerRef.current) {
      initLandmarker();
    }

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        try {
          landmarkerRef.current.close();
        } catch (e) {
          // ignore
        }
        landmarkerRef.current = null;
      }
    };
  }, [isEnabled]);

  // Start webcam stream
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Webcam access is not supported by your browser.');
      setStatus('camera_error');
      return;
    }

    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 320 },
          height: { ideal: 240 },
          frameRate: { ideal: 15, max: 20 },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setStatus('normal');
      }
    } catch (err: any) {
      console.error('Proctor Camera Access Error:', err);
      let msg = 'Camera permission denied or camera not available.';
      if (err.name === 'NotAllowedError') {
        msg = 'Camera permission was denied. Please allow camera access in browser settings.';
      } else if (err.name === 'NotFoundError') {
        msg = 'No camera device found on this system.';
      }
      setCameraError(msg);
      setStatus('camera_error');
    }
  }, [videoRef]);

  // Stop webcam stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    setCameraActive(false);
    setStatus('idle');
    setActiveViolation(null);
  }, [videoRef]);

  // Manage start/stop based on isEnabled
  useEffect(() => {
    if (isEnabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isEnabled, startCamera, stopCamera]);

  // Detection loop running on requestAnimationFrame, throttled to every ~200-250ms
  useEffect(() => {
    if (!isEnabled || !cameraActive) return;

    let isRunning = true;

    const processFrame = () => {
      if (!isRunning) return;

      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      const now = performance.now();

      // Throttle detection to every 220ms
      if (
        video &&
        landmarker &&
        video.readyState >= 2 &&
        !video.paused &&
        now - lastProcessedTimeRef.current >= 220
      ) {
        lastProcessedTimeRef.current = now;

        try {
          const results = landmarker.detectForVideo(video, now);
          const faces = results.faceLandmarks || [];

          let detectedViolation: ProctorViolationType | null = null;

          if (faces.length === 0) {
            detectedViolation = 'no_face';
          } else if (faces.length > 1) {
            detectedViolation = 'multiple_faces';
          } else {
            // Check Head Orientation / Looking Away on single face
            const landmarks = faces[0];
            if (landmarks && landmarks.length > 450) {
              const nose = landmarks[1] || landmarks[4];
              const leftCheek = landmarks[234];
              const rightCheek = landmarks[454];
              const forehead = landmarks[10];
              const chin = landmarks[152];

              if (nose && leftCheek && rightCheek && forehead && chin) {
                // Horizontal turn (yaw)
                const distLeft = Math.abs(nose.x - leftCheek.x);
                const distRight = Math.abs(rightCheek.x - nose.x);
                const hRatio = distLeft / (distRight + 0.00001);

                // Vertical tilt (pitch)
                const distTop = Math.abs(nose.y - forehead.y);
                const distBottom = Math.abs(chin.y - nose.y);
                const vRatio = distTop / (distBottom + 0.00001);

                // Significant turn left/right OR looking far up/down
                const isTurnedSideways = hRatio < 0.32 || hRatio > 3.1;
                const isLookingUpDown = vRatio < 0.38 || vRatio > 2.6;

                if (isTurnedSideways || isLookingUpDown) {
                  detectedViolation = 'looking_away';
                }
              }
            }
          }

          // Update active violation state
          setActiveViolation(detectedViolation);
          if (!detectedViolation) {
            setStatus('normal');
            violationStartTimeRef.current = null;
            currentViolatingTypeRef.current = null;
          } else {
            setStatus(detectedViolation);

            // Debounce logic to prevent instant triggers on natural head movements
            if (currentViolatingTypeRef.current !== detectedViolation) {
              currentViolatingTypeRef.current = detectedViolation;
              violationStartTimeRef.current = Date.now();
            } else if (violationStartTimeRef.current) {
              const duration = Date.now() - violationStartTimeRef.current;
              const timeSinceLastStrike = Date.now() - lastStrikeTimeRef.current;

              // If violation persisted longer than debounce threshold AND cooldown passed
              if (duration >= debounceViolationMs && timeSinceLastStrike >= strikeCooldownMs) {
                lastStrikeTimeRef.current = Date.now();
                violationStartTimeRef.current = Date.now(); // reset start time to require fresh persistence

                const nextStrike = currentStrikesRef.current + 1;
                currentStrikesRef.current = nextStrike;
                setStrikes(nextStrike);

                const messages: Record<ProctorViolationType, string> = {
                  no_face: 'Candidate left camera frame / No face detected',
                  multiple_faces: 'Multiple persons detected in camera frame',
                  looking_away: 'Candidate looked away / head turned from screen',
                };

                const newEvent: ProctorEvent = {
                  id: `proctor-evt-${Date.now()}`,
                  type: detectedViolation,
                  timestamp: new Date().toISOString(),
                  formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  message: messages[detectedViolation],
                  strikeNumber: nextStrike,
                };

                const updatedEvents = [newEvent, ...events];
                setEvents((prev) => [newEvent, ...prev]);

                if (onStrike) {
                  onStrike(nextStrike, newEvent);
                }

                if (nextStrike >= maxStrikes && onMaxStrikesReached) {
                  onMaxStrikesReached(newEvent, updatedEvents);
                }
              }
            }
          }
        } catch (detectionErr) {
          // Frame dropped or WebGL context loss
          console.debug('Proctor detection frame skipped:', detectionErr);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(processFrame);
    };

    animFrameIdRef.current = requestAnimationFrame(processFrame);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isEnabled, cameraActive, debounceViolationMs, strikeCooldownMs, maxStrikes, onStrike, onMaxStrikesReached, videoRef, events]);

  return {
    status,
    activeViolation,
    strikes,
    events,
    cameraActive,
    cameraError,
    startCamera,
    stopCamera,
  };
}
