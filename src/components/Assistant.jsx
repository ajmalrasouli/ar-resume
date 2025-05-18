const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);
  setError(null);

  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) throw new Error('API request failed');
    
    const data = await response.json();
    setResponse(data[0]?.generated_text || "No response generated");
    
  } catch (err) {
    setError(err.message);
  } finally {
    setIsLoading(false);
  }
};