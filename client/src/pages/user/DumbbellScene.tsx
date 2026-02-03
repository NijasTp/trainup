import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Environment, ContactShadows, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

function Model({ ...props }) {
    const { scene, nodes, materials } = useGLTF('/assets/dumbbell-3d/scene.gltf') as any

    // Apply metallic properties as requested
    useMemo(() => {
        Object.values(materials).forEach((material: any) => {
            if (material) {
                material.metalness = 0.8
                material.roughness = 0.25
                material.envMapIntensity = 1.2
            }
        })
    }, [materials])

    return <primitive object={scene} {...props} />
}

export default function DumbbellScene({ modelRef }: { modelRef: React.RefObject<THREE.Group> }) {
    return (
        <div className="fixed inset-0 z-10 pointer-events-none">
            <Canvas shadows dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />

                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <directionalLight position={[-5, 5, 5]} intensity={0.8} />
                <pointLight position={[0, -5, 5]} intensity={0.5} color="#ff8e3c" /> {/* Subtle orange accent */}

                <group ref={modelRef} dispose={null}>
                    <Model scale={2} rotation={[0, 0, 1.57]} />
                </group>

                <Environment preset="studio" />
                <ContactShadows
                    position={[0, -2, 0]}
                    opacity={0.4}
                    scale={10}
                    blur={2.5}
                    far={4}
                />
            </Canvas>
        </div>
    )
}
