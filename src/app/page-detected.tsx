// WebcamCapture.js

'use client'
import React, { useEffect, useRef } from 'react'
import Webcam from 'react-webcam'
import * as faceapi from 'face-api.js'

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: 'user'
}

const WebcamCapture = () => {
  const webcamRef = useRef(null)
  const canvasRef = useRef(null)

  // Cargar modelos al montar el componente
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL)
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL)
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      console.log('Face-api.js models loaded successfully!')
    }

    loadModels()
  }, [])

  // Intervalo para detectar gestos faciales
  useEffect(() => {
    const interval = setInterval(async () => {
      if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
        const video = webcamRef.current.video
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()

        if (detections.length > 0 && canvasRef.current) {
          const canvas = canvasRef.current
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext('2d')
          ctx.clearRect(0, 0, canvas.width, canvas.height)

          faceapi.draw.drawDetections(canvas, detections)
          faceapi.draw.drawFaceLandmarks(canvas, detections)
          faceapi.draw.drawFaceExpressions(canvas, detections)

          // Logica para detectar gestos específicos
          detections.forEach(det => {
            const expressions = det.expressions
            const landmarks = det.landmarks
            const nose = landmarks.getNose()

            if (expressions.happy > 0.9) {
              console.log('La persona está sonriendo.')
            }
            if (expressions.surprised > 0.9) {
              console.log('La persona está sorprendida.')
            }
            if (nose[3].x - nose[0].x > 50) {
              console.log('La persona ha movido la cabeza hacia la derecha.')
            }
          })
        }
      }
    }, 500) // Intervalo de detección cada 500ms

    return () => {
      clearInterval(interval)
      console.log('Interval cleared!')
    }
  }, [])

  return (
    <div style={{ position: 'relative' }}>
      <Webcam ref={webcamRef} audio={false} height={720} screenshotFormat="image/jpeg" width={1280} videoConstraints={videoConstraints} />
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0 }} />
    </div>
  )
}

export default WebcamCapture
