import { useState, useEffect } from 'react';
import { Box, Typography, Chip, Button, LinearProgress, Card, CardContent, CardActions } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Delete, Download } from '@mui/icons-material';

const ProjectDetail = () => {
  const { id } = useParams(); 
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/project/${id}`);
        if (!response.ok) {
          throw new Error('Project not found');
        }
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [id]);

  const handleDelete = async () => {
    try {
      const response = await fetch(`/project/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        navigate('/projects'); 
      } else {
        throw new Error('Error deleting project');
      }
    } catch (error) {
      console.error('ERROR:', error);
    }
  };

  if (!project) return <LinearProgress color="inherit" />;

  const market = project.market ? project.market.split(',') : [];

  const getEuRiskColor = (risk) => {
    switch (risk) {
      case 'Unlimited':
        return 'error.main'; 
      case 'High':
        return 'warning.main'; 
      case 'Limited':
        return 'success.main'; 
      default:
        return 'text.primary';
    }
  };

  return (
    <Box sx={{ padding: 5 }}>
        <Card>
        <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Project Name
            </Typography>
            <Typography variant="h4" gutterBottom><b>{project.name}</b></Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Description
            </Typography>
            <Typography paragraph>{project.description}</Typography>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                Markets
            </Typography>
            <Box sx={{ marginBottom: 2 }}>
                {market.map((market, index) => (
                <Chip key={index} label={market} sx={{ marginRight: 1 }} />
                ))}
            </Box>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                EU Risk
            </Typography>
            <Box sx={{ marginBottom: 2 }}>
                <Typography variant="h6" sx={{ color: getEuRiskColor(project.euRisk) }}>
                    <b>{project.euRisk}</b>
                </Typography>
            </Box>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                EU Risk Report
            </Typography>
            <Typography paragraph>{project.euRiskReason}</Typography>
            {project.attachment && (
                <>
                <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
                    Attachments
                </Typography>
                <a href={project.attachment} target="_blank" rel="noopener noreferrer">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Download sx={{ marginRight: 1 }}/>
                        Download Attachment
                </Box>
                </a>
                </>
            )}
            <Box mt={2}></Box>
            <Button variant="contained" color="error" onClick={handleDelete} startIcon={<Delete />}>
                Delete
            </Button>
        </CardContent>
        </Card>
    </Box>
  );
};

export default ProjectDetail;
