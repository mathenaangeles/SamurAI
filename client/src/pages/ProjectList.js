import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Stack, Typography, InputAdornment, TextField, Card, CardContent } from '@mui/material';
import { Add, Delete, Search } from '@mui/icons-material';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Link } from 'react-router-dom';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProjects = async () => {
    const response = await fetch("http://127.0.0.1:5000/projects");
    const data = await response.json();
    const formattedProjects = data.projects.map(project => ({
      ...project,
      createdDate: new Date(project.createdDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    }));
    setProjects(formattedProjects);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (id) => {
    try {
      await fetch(`/project/${id}`, {
        method: 'DELETE',
      });
      setProjects(projects.filter((project) => project.id !== id));
    } catch (error) {
      console.error('ERROR', error);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unacceptableRiskCount = projects.filter(project => project.euRisk === 'Unacceptable').length;
  const highRiskCount = projects.filter(project => project.euRisk === 'High').length;
  const limitedRiskCount = projects.filter(project => project.euRisk === 'Limited').length;
  const minimalRiskCount = projects.filter(project => project.euRisk === 'Minimal').length;

  const data = {
    labels: ['Unacceptable', 'High', 'Limited', 'Minimal'],
    datasets: [{
      label: 'Risk Count',
      data: [unacceptableRiskCount, highRiskCount, limitedRiskCount, minimalRiskCount],
      backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 'rgba(75, 192, 192, 0.2)'],
      borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 'rgba(75, 192, 192, 1)'],
      borderWidth: 1,
    }]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          }
        }
      }
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', 
      headerName: 'Name', 
      width: 150,
      renderCell: (params) => (
        <Link to={`/project/${params.row.id}`} 
        sx={{
          textDecoration: 'none',
          color: 'inherit !important', 
          fontWeight: 'bold'
        }}>
          {params.value}
        </Link>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 300,
      sortable: false, 
    },
    { field: 'euRisk', headerName: 'EU Risk', width: 100, },
    { field: 'createdDate', headerName: 'Created On', width: 150, },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <Button color="error" onClick={() => handleDelete(params.row.id)} startIcon={<Delete />}>
          Delete
        </Button>
      )
    }
  ];

  return (
    <Box p={5}>
      <Stack my={2} direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
        <Typography variant="h4"><b>Project Inventory</b></Typography>
        <Box>
          <TextField
            label="Search"
            variant="outlined"
            value={searchQuery}
            onChange={handleSearch}
            size="small"
            sx={{ marginRight: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <Link to={'/form'}>
            <Button variant="contained" startIcon={<Add />}>
              Add Project
            </Button>
          </Link>
        </Box>
      </Stack>
      <Stack direction="row" spacing={2} mb={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, flexGrow: 1 }}>
          <Card sx={{ minWidth: 150 }}>
            <CardContent>
              <Typography variant="body1">Unacceptable Risk</Typography>
              <Typography className="risk-statistic">{unacceptableRiskCount}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 150 }}>
            <CardContent>
              <Typography variant="body1">High Risk</Typography>
              <Typography className="risk-statistic">{highRiskCount}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 150 }}>
            <CardContent>
              <Typography variant="body1">Limited Risk</Typography>
              <Typography className="risk-statistic">{limitedRiskCount}</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 150 }}>
            <CardContent>
              <Typography variant="body1">Minimal Risk</Typography>
              <Typography className="risk-statistic">{minimalRiskCount}</Typography>
            </CardContent>
          </Card>
        </Box>
        <Box sx={{ width: '50%', height: '100%' }}>
          <Bar data={data} options={options} />
        </Box>
      </Stack>
      <DataGrid
        rows={filteredProjects}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
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
        }}
      />
    </Box>
  );
}

export default ProjectList;
