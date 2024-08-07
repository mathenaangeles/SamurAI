import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, LinearProgress, Alert, Typography } from '@mui/material';

const Library = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch('/files');
        if (!response.ok) {
          throw new Error('Error fetching files');
        }
        const data = await response.json();
        setFiles(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const columns = [
    { 
      field: 'name', 
      headerName: 'Name', 
      width: 500, 
      renderCell: (params) => (
        <Typography 
          component="a" 
          href="#" 
        >
          {params.value}
        </Typography>
      )
    },
    { 
      field: 'size', 
      headerName: 'Size', 
      width: 150, 
    },
  ];

  const rows = files.map((file, index) => ({
    id: index,
    name: file.filename,
    size: file.size,
  }));

  if (loading) return <LinearProgress color="inherit" />;

  return (
    <Box sx={{ padding: 5 }}>
      <Typography variant="h4" component="div" gutterBottom>
        <b>Library Inventory</b>
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <DataGrid rows={rows} columns={columns} pageSize={5} 
    sx={{
        '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f0f0f0',
            fontWeight: 'bold',
            textAlign: 'center',
        },
        '& .MuiDataGrid-columnHeader': {
            display: 'flex',
            justifyContent: 'center',
        },
        '& .MuiDataGrid-columnHeaderTitle': {
            alignItems: 'center',
            width: '100%',
            fontWeight: 'bold',
        },
        '& .MuiDataGrid-cell': {
            padding: '0 16px',
        },
        '& .MuiDataGrid-root': {
            padding: '16px',
        },
        }}/>
    </Box>
  );
};

export default Library;
