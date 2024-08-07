import React, { useState } from 'react';
import { Box, Typography, TextField, IconButton, InputAdornment, Chip } from '@mui/material';
import { Send, ThumbUp, ThumbDown } from '@mui/icons-material';
import axios from 'axios';

const Assistant = () => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [feedback, setFeedback] = useState({}); // To keep track of which feedback was given

    const handleSubmit = async () => {
        if (query.trim() === '') return;
        const userMessage = { text: query, type: 'user' };
        setMessages([...messages, userMessage]);

        try {
            const result = await axios.post('/', { query });
            setQuery('');
            const systemMessage = {
                text: result.data.answer,
                type: 'system',
                sources: result.data.context || [],
            };
            setMessages([...messages, userMessage, systemMessage]);
        } catch (error) {
            console.error('ERROR: ', error);
        }
    };

    const handleFeedback = (index, feedbackType) => {
        setFeedback((prevFeedback) => ({
            ...prevFeedback,
            [index]: feedbackType
        }));
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: '#222',
            }}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    padding: 6,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {messages.map((msg, index) => (
                    <Box
                        key={index}
                        sx={{
                            alignSelf: msg.type === 'user' ? 'flex-end' : 'flex-start',
                            backgroundColor: msg.type === 'user' ? '#3772FF' : '#444',
                            color: 'white',
                            borderRadius: 1,
                            padding: 1,
                            marginBottom: 1,
                            maxWidth: '70%',
                            wordBreak: 'break-word',
                        }}
                    >
                        <Typography variant="body1">{msg.text}</Typography>
                        {msg.type === 'system' && msg.sources.length > 0 && (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    marginTop: 1,
                                    gap: 1,
                                }}
                            >
                                <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
                                    {msg.sources.map((source, idx) => (
                                        <Chip key={idx} label={source.replace('data/','')} variant="outlined" color="info" />
                                    ))}
                                </Box>
                                <IconButton
                                    onClick={() => handleFeedback(index, 'thumbsUp')}
                                    sx={{ color: feedback[index] === 'thumbsUp' ? 'green' : 'inherit' }}
                                >
                                    <ThumbUp color={feedback[index] === 'thumbsUp' ? 'success' : 'action'} />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleFeedback(index, 'thumbsDown')}
                                    sx={{ color: feedback[index] === 'thumbsDown' ? 'red' : 'inherit' }}
                                >
                                    <ThumbDown color={feedback[index] === 'thumbsDown' ? 'error' : 'action'} />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 1,
                    backgroundColor: '#333',
                    borderRadius: '10px 10px 0 0', 
                    boxShadow: '0 -2px 4px rgba(0,0,0,0.1)', 
                }}
            >
                <TextField
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={1}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter your query"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton

                                    onClick={handleSubmit}
                                    sx={{ borderRadius: '50%' }}
                                >
                                    <Send />
                                </IconButton>
                            </InputAdornment>
                        ),
                        sx: { backgroundColor: '#555', borderRadius: '20px' }
                    }}
                    sx={{ marginRight: 2 }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit();
                        }
                    }}
                />
            </Box>
        </Box>
    );
};

export default Assistant;
