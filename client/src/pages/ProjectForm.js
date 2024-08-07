import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import { TextField, Button, Box, Typography, Container, Select, MenuItem, InputLabel, FormControl, Chip, Alert } from '@mui/material';
import { CloudUpload, Publish } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const countries = [
    "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark",
    "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Ireland", "Italy",
    "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Poland", "Portugal",
    "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Canada", "China"
];

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const ProjectForm = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            market: '', 
            attachment: []
        },
        validationSchema: Yup.object({
            name: Yup.string().required('The project name is required'),
            description: Yup.string().required('The description is required'),
            market: Yup.string().required('At least one market is required.')
        }),
        onSubmit: async (values) => {
            const formData = new FormData();
            formData.append('name', values.name);
            formData.append('description', values.description);
            formData.append('market', values.market);

            uploadedFiles.forEach((file) => {
                formData.append('attachment', file);
            });

            try {
                const response = await fetch('/projects', {
                    method: 'POST',
                    body: formData,
                });
                console.log(response);
                setSuccessMessage("The new project has been successfully created");
            } catch (error) {
                console.error('ERROR: ', error);
            }
        }
    });

    const handleMarketChange = (event) => {
        const selectedValues = event.target.value;
        const marketString = selectedValues.join(',');
        formik.setFieldValue('market', marketString);
    };

    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
        formik.setFieldValue('attachment', files);
    };

    const handleDeleteFile = (fileName) => {
        setUploadedFiles((prevFiles) => {
            const newFiles = prevFiles.filter(file => file.name !== fileName);
            // Update formik state to reflect the current files
            formik.setFieldValue('attachment', newFiles);
            return newFiles;
        });
    };

    const handleButtonClick = () => {
        document.getElementById('file-input').click();
    };

    return (
        <Box p={5}>
            <Box sx={{ marginTop: 4 }}>
                <Typography variant="h5" mb={1}><b>Project Form</b></Typography>
                <Typography variant="body1" mb={2} sx={{ color: '#d9d9d9' }}>
                    Please note that the <b>EU risk level</b> will be automatically generated based on the
                    project details and documentation provided below. 
                </Typography>
                { successMessage!=='' && <Alert severity="success" mb={2}>{successMessage}</Alert>}
                <Box my={4}/>
                <form onSubmit={formik.handleSubmit}>
                    <TextField
                        fullWidth
                        id="name"
                        name="name"
                        label="Project Name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        fullWidth
                        id="description"
                        name="description"
                        label="Description"
                        multiline
                        rows={4}
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        error={formik.touched.description && Boolean(formik.errors.description)}
                        helperText={formik.touched.description && formik.errors.description}
                        sx={{ marginBottom: 2 }}
                    />
                    <FormControl fullWidth sx={{ marginBottom: 2 }}>
                        <InputLabel id="market-label">Market</InputLabel>
                        <Select
                            labelId="market-label"
                            label="Market"
                            id="market"
                            name="market"
                            multiple
                            value={formik.values.market ? formik.values.market.split(',') : []}
                            onChange={handleMarketChange}
                            renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => (
                                        <Chip
                                            label={value}
                                            key={value}
                                            color="primary"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            )}
                            error={formik.touched.market && Boolean(formik.errors.market)}
                        >
                            {countries.map((country) => (
                                <MenuItem key={country} value={country}>
                                    {country}
                                </MenuItem>
                            ))}
                        </Select>
                        {formik.touched.market && formik.errors.market && (
                            <Typography color="error">{formik.errors.market}</Typography>
                        )}
                    </FormControl>
                    <Button
                        component="span"
                        role={undefined}
                        variant="outlined"
                        startIcon={<CloudUpload />}
                        onClick={handleButtonClick}
                        sx={{ marginBottom: 2 }}
                    >
                        Upload File
                    </Button>
                    <VisuallyHiddenInput
                        id="file-input"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                    />
                    <Box>
                        {uploadedFiles.map((file) => (
                            <Chip
                                key={file.name}
                                label={file.name}
                                onDelete={() => handleDeleteFile(file.name)}
                            />
                        ))}
                    </Box>
                    <Box sx={{ marginTop: 5 }}>
                        <Button color="primary" variant="contained" type="submit"  startIcon={<Publish />}>
                            Submit
                        </Button>
                    </Box>
                </form>
            </Box>
        </Box>
    );
};

export default ProjectForm;
