import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Warehouse3D() {
  const containerRef = useRef(null)
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(15, 10, 15)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.shadowMap.enabled = true
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(10, 20, 10)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(40, 40)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x2a2a3e })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    // Create warehouse racks (boxes)
    const racks = []
    const rackMaterial = new THREE.MeshStandardMaterial({ color: 0x00d4ff })
    
    for (let x = -8; x <= 8; x += 4) {
      for (let z = -8; z <= 8; z += 4) {
        const rackGeometry = new THREE.BoxGeometry(2, 6, 2)
        const rack = new THREE.Mesh(rackGeometry, rackMaterial)
        rack.position.set(x, 3, z)
        rack.castShadow = true
        rack.receiveShadow = true
        scene.add(rack)
        racks.push({ mesh: rack, originalY: 3 })
      }
    }

    // Create animated boxes (shipments)
    const boxes = []
    const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b })
    
    for (let i = 0; i < 8; i++) {
      const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
      const box = new THREE.Mesh(boxGeometry, boxMaterial)
      box.position.set(
        (Math.random() - 0.5) * 20,
        Math.random() * 8 + 1,
        (Math.random() - 0.5) * 20
      )
      box.castShadow = true
      box.receiveShadow = true
      scene.add(box)
      boxes.push({
        mesh: box,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.05,
          0,
          (Math.random() - 0.5) * 0.05
        ),
        targetY: Math.random() * 8 + 1
      })
    }

    // Animation loop
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Animate racks (pulse effect)
      racks.forEach((rack, idx) => {
        const time = Date.now() * 0.001 + idx * 0.5
        rack.mesh.position.y = rack.originalY + Math.sin(time) * 0.3
      })

      // Animate boxes (moving shipments)
      boxes.forEach((box) => {
        box.mesh.position.add(box.velocity)
        box.mesh.rotation.x += 0.01
        box.mesh.rotation.y += 0.01

        // Bounce off walls
        if (Math.abs(box.mesh.position.x) > 15) box.velocity.x *= -1
        if (Math.abs(box.mesh.position.z) > 15) box.velocity.z *= -1
        if (box.mesh.position.y > 10 || box.mesh.position.y < 1) {
          box.velocity.y *= -1
        }
      })

      // Rotate camera around scene
      const time = Date.now() * 0.0002
      camera.position.x = Math.cos(time) * 20
      camera.position.z = Math.sin(time) * 20
      camera.lookAt(0, 5, 0)

      renderer.render(scene, camera)
    }
    animate()

    // Handle window resize
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
