import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function Network3D() {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0f1419)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 30)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    containerRef.current.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const pointLight = new THREE.PointLight(0x00d4ff, 1)
    pointLight.position.set(10, 10, 10)
    scene.add(pointLight)

    // Create network nodes
    const nodes = []
    const nodePositions = [
      { x: -10, y: 10, z: 0, label: 'Bokaro' },
      { x: 10, y: 10, z: 0, label: 'Kolkata' },
      { x: -10, y: -10, z: 0, label: 'Patna' },
      { x: 10, y: -10, z: 0, label: 'Ranchi' },
      { x: 0, y: 0, z: 0, label: 'Hub' },
      { x: -5, y: 5, z: 5, label: 'Durgapur' },
      { x: 5, y: -5, z: -5, label: 'Haldia' },
    ]

    const nodeMaterial = new THREE.MeshStandardMaterial({ color: 0x00d4ff, emissive: 0x00a8cc })
    nodePositions.forEach((pos) => {
      const geometry = new THREE.SphereGeometry(0.8, 32, 32)
      const node = new THREE.Mesh(geometry, nodeMaterial)
      node.position.set(pos.x, pos.y, pos.z)
      node.userData = { label: pos.label, originalPos: pos }
      scene.add(node)
      nodes.push(node)
    })

    // Create connections (lines between nodes)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00d4ff, linewidth: 2 })
    const connections = [
      [0, 4], [1, 4], [2, 4], [3, 4], [0, 1], [2, 3], [5, 4], [6, 4]
    ]

    connections.forEach(([from, to]) => {
      const points = [
        new THREE.Vector3(nodePositions[from].x, nodePositions[from].y, nodePositions[from].z),
        new THREE.Vector3(nodePositions[to].x, nodePositions[to].y, nodePositions[to].z)
      ]
      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const line = new THREE.Line(geometry, lineMaterial)
      scene.add(line)
    })

    // Create animated particles along connections
    const particles = []
    connections.forEach(([from, to]) => {
      for (let i = 0; i < 3; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.2, 8, 8)
        const particleMaterial = new THREE.MeshStandardMaterial({ color: 0xff6b6b, emissive: 0xff4444 })
        const particle = new THREE.Mesh(particleGeometry, particleMaterial)
        scene.add(particle)
        particles.push({
          mesh: particle,
          from: nodePositions[from],
          to: nodePositions[to],
          progress: Math.random(),
          speed: 0.005 + Math.random() * 0.005
        })
      }
    })

    // Animation loop
    let animationId
    const animate = () => {
      animationId = requestAnimationFrame(animate)

      // Animate nodes (pulse and orbit)
      nodes.forEach((node, idx) => {
        const time = Date.now() * 0.001 + idx * 0.3
        const scale = 1 + Math.sin(time) * 0.2
        node.scale.set(scale, scale, scale)

        // Slight orbit
        const orbitRadius = 0.5
        node.position.x = node.userData.originalPos.x + Math.cos(time) * orbitRadius
        node.position.y = node.userData.originalPos.y + Math.sin(time) * orbitRadius
      })

      // Animate particles
      particles.forEach((particle) => {
        particle.progress += particle.speed
        if (particle.progress > 1) particle.progress = 0

        const from = particle.from
        const to = particle.to
        particle.mesh.position.lerpVectors(
          new THREE.Vector3(from.x, from.y, from.z),
          new THREE.Vector3(to.x, to.y, to.z),
          particle.progress
        )
      })

      // Rotate camera
      const time = Date.now() * 0.0001
      camera.position.x = Math.cos(time) * 30
      camera.position.z = Math.sin(time) * 30
      camera.lookAt(0, 0, 0)

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
