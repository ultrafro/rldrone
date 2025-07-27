import { BufferGeometry, Float32BufferAttribute } from "three";

export function EdgesOnlyBox({
  position,
  size,
  color,
}: {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  const [width, height, depth] = size;
  const halfWidth = width / 2;
  const halfHeight = height / 2;
  const halfDepth = depth / 2;

  // Create vertices for all 12 edges of a box
  const vertices = new Float32Array([
    // Bottom face edges
    -halfWidth,
    -halfHeight,
    -halfDepth,
    halfWidth,
    -halfHeight,
    -halfDepth, // front edge
    -halfWidth,
    -halfHeight,
    -halfDepth,
    -halfWidth,
    -halfHeight,
    halfDepth, // left edge
    halfWidth,
    -halfHeight,
    -halfDepth,
    halfWidth,
    -halfHeight,
    halfDepth, // right edge
    -halfWidth,
    -halfHeight,
    halfDepth,
    halfWidth,
    -halfHeight,
    halfDepth, // back edge

    // Top face edges
    -halfWidth,
    halfHeight,
    -halfDepth,
    halfWidth,
    halfHeight,
    -halfDepth, // front edge
    -halfWidth,
    halfHeight,
    -halfDepth,
    -halfWidth,
    halfHeight,
    halfDepth, // left edge
    halfWidth,
    halfHeight,
    -halfDepth,
    halfWidth,
    halfHeight,
    halfDepth, // right edge
    -halfWidth,
    halfHeight,
    halfDepth,
    halfWidth,
    halfHeight,
    halfDepth, // back edge

    // Vertical edges
    -halfWidth,
    -halfHeight,
    -halfDepth,
    -halfWidth,
    halfHeight,
    -halfDepth, // front-left
    halfWidth,
    -halfHeight,
    -halfDepth,
    halfWidth,
    halfHeight,
    -halfDepth, // front-right
    -halfWidth,
    -halfHeight,
    halfDepth,
    -halfWidth,
    halfHeight,
    halfDepth, // back-left
    halfWidth,
    -halfHeight,
    halfDepth,
    halfWidth,
    halfHeight,
    halfDepth, // back-right
  ]);

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(vertices, 3));

  return (
    <lineSegments position={position}>
      <primitive object={geometry} />
      <lineBasicMaterial color={color} transparent={true} opacity={0.8} />
    </lineSegments>
  );
}
