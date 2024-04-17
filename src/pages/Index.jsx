import React, { useState, useRef, useEffect } from "react";
import { Box, Circle, Text, VStack } from "@chakra-ui/react";

const Index = () => {
  const canvasRef = useRef(null);
  const [selectedColors, setSelectedColors] = useState([]);

  const drawColorWheel = (ctx, radius) => {
    let image = ctx.createImageData(2 * radius, 2 * radius);
    let data = image.data;

    for (let x = -radius; x < radius; x++) {
      for (let y = -radius; y < radius; y++) {
        let [r, phi] = xyToPolar(x, y);

        if (r > radius) {
          continue;
        }

        let deg = radToDeg(phi);
        let [red, green, blue] = hslToRgb(deg, r / radius, 1.0);

        let index = (x + radius + (y + radius) * image.width) * 4;
        data[index] = red;
        data[index + 1] = green;
        data[index + 2] = blue;
        data[index + 3] = 255; // Alpha
      }
    }

    ctx.putImageData(image, 0, 0);
  };

  const handleCanvasClick = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const [r, phi] = xyToPolar(x, y);

    if (r > rect.width / 2) {
      return;
    }

    const deg = radToDeg(phi);
    const [red, green, blue] = hslToRgb(deg, r / (rect.width / 2), 1.0);
    const hex = rgbToHex(red, green, blue);

    setSelectedColors([...selectedColors, { hex, x: x + rect.width / 2, y: y + rect.height / 2 }]);
  };

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");
    const radius = canvasRef.current.width / 2;
    drawColorWheel(ctx, radius);
  }, []);

  return (
    <VStack spacing={4}>
      <canvas ref={canvasRef} width="300" height="300" onClick={handleCanvasClick} style={{ cursor: "crosshair" }} />
      <Box>
        {selectedColors.map((color, index) => (
          <Circle key={index} size="30px" bg={color.hex} position="absolute" left={color.x - 15} top={color.y - 15} border="2px solid white" />
        ))}
      </Box>
      <VStack>
        {selectedColors.map((color, index) => (
          <Text key={index} fontSize="lg" fontWeight="bold" color="gray.700">
            {color.hex}
          </Text>
        ))}
      </VStack>
    </VStack>
  );
};

const xyToPolar = (x, y) => {
  let r = Math.sqrt(x * x + y * y);
  let phi = Math.atan2(y, x);
  return [r, phi];
};

const radToDeg = (rad) => {
  return ((rad + Math.PI) / (2 * Math.PI)) * 360;
};

const hslToRgb = (h, s, l) => {
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = l - c / 2;
  let [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
};

const rgbToHex = (r, g, b) => {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
};

export default Index;
