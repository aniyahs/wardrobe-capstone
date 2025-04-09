export const predictTags = async (imageUrl: string) => {
    try {
      const response = await fetch('http://10.0.2.2:5001/predict/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to predict tags');
      }
  
      const data = await response.json();
      return data; 
    } catch (error) {
      console.error('Error predicting tags:', error);
      throw error;
    }
  };
  