import { useState, useEffect, useMemo } from "react";
import axios from "axios";

interface UseImageBrightness {
  brightness: number;
  setImageUrl: React.Dispatch<React.SetStateAction<string | undefined>>;
  isLoading: boolean;
}

function useImageBrightness(): UseImageBrightness {
  const [brightness, setBrightness] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const brightnessCache = useMemo(() => {
    const cache = new Map<string, number>();
    return {
      get: (url: string) => cache.get(url),
      set: (url: string, value: number) => cache.set(url, value),
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    if (!imageUrl) {
      setIsLoading(false);
      return;
    }
    const cachedBrightness = brightnessCache.get(imageUrl);

    if (imageUrl && cachedBrightness !== undefined) {
      setBrightness(cachedBrightness);
      setIsLoading(false);
      return;
    }

    if (!imageUrl) {
      setBrightness(0);
      setIsLoading(false);
      return;
    }

    axios
      .get(imageUrl, { responseType: "blob" })
      .then((response) => {
        const image = new Image();
        image.src = URL.createObjectURL(response.data);
        image.onload = () => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          if (!context) return;
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0, image.width, image.height);
          const imageData = context.getImageData(
            0,
            0,
            image.width,
            image.height
          ).data;
          let sum = 0;
          for (let i = 0; i < imageData.length; i += 4) {
            sum += (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
          }
          const averageBrightness = sum / (image.width * image.height);
          setBrightness(averageBrightness);
          brightnessCache.set(imageUrl, averageBrightness);
        };
      })
      .catch((error) => {
        console.error("Error loading image:", error);
        setBrightness(0);
      })
      .finally(() => setIsLoading(false));
  }, [imageUrl, brightnessCache, isLoading]);

  return {
    brightness,
    setImageUrl,
    isLoading,
  };
}

export default useImageBrightness;
