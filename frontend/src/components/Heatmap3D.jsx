import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Heatmap3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 15, 15)
    camera.lookAt(0, 0, 0)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    scene.add(directionalLight)

    // Create heatmap grid
    const gridSize = 10
    const cellSize = 2
    const heatmapData = []

    for (let x = 0; x < gridSize; x++) {
      for (let z = 0; z < gridSize; z++) {
        const intensity = Math.sin(x * 0.5) * Math.cos(z * 0.5) * 0.5 + 0.5
        heatmapData.push({ x, z, intensity })
      }
    }

    // Create bars for heatmap
    const bars = []
    heatmapData.forEach((data) => {
      const height = data.intensity * 8 + 0.5
      const geometry = new THREE.BoxGeometry(cellSize * 0.8, height, cellSize * 0.8)
      
      // Color based on intensity
      const hue = (1 - data.intensity) * 240 // Blue to Red
      const color = new THREE.Color()
      color.setHSL(hue / 360, 1, 0.5)
      
      const material = new THREE.MeshStandardMaterial({ color })
      const bar = new THREE.Mesh(geometry, material)
      bar.position.set(
        (data.x - gridSize / 2) * cellSize,
        height / 2,
        (data.z - gridSize / 2) * cellSize
      )
      bar.userData = { data, originalHeight: height }
      scene.add(bar)
      bars.push(bar)
    })

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(gridSize * cellSize, gridSize * cellSize)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3e })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.1
    scene.add(ground)

    // Animation loop
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Animate bars
      bars.forEach((bar, idx) => {
        const time = Date.now() * 0.001 + idx * 0.1
        const scale = 1 + Math.sin(time) * 0.2
        bar.scale.y = scale
        bar.position.y = (bar.userData.originalHeight / 2) * scale
      })

      // Rotate camera
      const time = Date.now() * 0.0002
      camera.position.x = Math.cos(time) * 25
      camera.position.z = Math.sin(time) * 25
      camera.lookAt(0, 5, 0)

      renderer.render(scene, camera)
    }
    animate()

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationId)
      containerRef.current?.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '500px' }} />
}
