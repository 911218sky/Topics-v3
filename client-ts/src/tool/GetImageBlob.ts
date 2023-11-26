function getImageBlob(imageFile: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result as ArrayBuffer;
      const blob = new Blob([arrayBuffer], { type: imageFile.type });
      resolve(blob);
    };
    reader.readAsArrayBuffer(imageFile);
  });
}

export default getImageBlob;
