import { useState, useEffect } from "react";

const useImage = (imageName: string) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/get-image/${imageName}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener la imagen");
        }

        const data = await response.json();
        setImageUrl(data.image_url);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchImage();
  }, [imageName]);

  return { imageUrl, loading, error };
};

export default useImage;
