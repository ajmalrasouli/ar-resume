import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';

const ImageGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const generateImage = async () => {
        if (!prompt.trim()) {
            setError('Please enter a prompt');
            return;
        }

        setIsLoading(true);
        setError('');
        setImage(null);

        try {
            // Use the full URL for local development
            const apiUrl = process.env.NODE_ENV === 'development' 
                ? 'http://localhost:7071/api/generate-image' 
                : '/api/generate-image';
            
            // Add a timeout to the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
            
            const response = await fetch(apiUrl, {
                signal: controller.signal,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            clearTimeout(timeoutId); // Clear the timeout if the request completes
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate image');
            }

            if (data.success && data.image) {
                setImage(`data:image/png;base64,${data.image}`);
            } else {
                throw new Error('No image data received');
            }
        } catch (error) {
            console.error('Error generating image:', error);
            if (error.name === 'AbortError') {
                setError('The request took too long. Please try again with a simpler prompt.');
            } else {
                setError(error.message || 'Failed to generate image. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mb-4">
            <Card.Body>
                <Card.Title>AI Image Generator</Card.Title>
                <Card.Text>
                    Generate images from text using AI. Describe what you'd like to see!
                </Card.Text>
                
                <Form.Group className="mb-3">
                    <Form.Label>Describe your image:</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="A beautiful sunset over mountains..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        disabled={isLoading}
                    />
                </Form.Group>

                <div className="d-grid gap-2">
                    <Button 
                        variant="primary" 
                        onClick={generateImage}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Spinner
                                    as="span"
                                    animation="border"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    className="me-2"
                                />
                                Generating...
                            </>
                        ) : 'Generate Image'}
                    </Button>
                </div>

                {error && (
                    <Alert variant="danger" className="mt-3 mb-0">
                        {error}
                    </Alert>
                )}

                {image && (
                    <div className="mt-4 text-center">
                        <Card.Img 
                            src={image} 
                            alt="Generated from AI" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '500px', width: 'auto' }}
                        />
                        <div className="mt-2">
                            <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.href = image;
                                    link.download = `ai-image-${Date.now()}.png`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                }}
                            >
                                <i className="bi bi-download me-1"></i> Download
                            </Button>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default ImageGenerator;