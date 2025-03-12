//import { useState } from 'react'
import './App.css'
import React from 'react';
import './index.css';

//ponent.css'; // Optional: For custom styling


function App() {

  return (
    <>
     <TableComponent/>
    </>
  )
}


import { Grid2, Paper, Typography } from '@mui/material';

const TableComponent = () => {
  const data = [
    { rank: 1, name: 'Rohit', runs: 10000, centuries: 29, strikeRate: 97, avg: 55 },
    { rank: 2, name: 'Virat', runs: 12000, centuries: 40, strikeRate: 91, avg: 49 },
    { rank: 3, name: 'Rahul', runs: 5000, centuries: 8, strikeRate: 85, avg: 45 },
    { rank: 4, name: 'Rishabh', runs: 4000, centuries: 2, strikeRate: 89, avg: 39 },
  ];

  return (
    <div>
      <Typography variant="h4" align="center" style={{ color: 'green', marginTop: '20px' }}>
        GeeksforGeeks
      </Typography>
      <Typography variant="h5" align="center" style={{ marginBottom: '20px' }}>
        Default Table
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <Grid2 container spacing={2}>
          {/* Header Row */}
          <Grid2 size={{ xs: 2 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Rank
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 2 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Name
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 2 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Runs
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 2 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Centuries
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 2 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Strike Rate
            </Typography>
          </Grid2>
          <Grid2 size={{ xs: 2 }}>
            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
              Avg
            </Typography>
          </Grid2>

          {/* Data Rows */}
          {data.map((row) => (
            <React.Fragment key={row.rank}>
              <Grid2 size={{ xs: 2 }}>
                <Typography>{row.rank}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 2 }}>
                <Typography>{row.name}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 2 }}>
                <Typography>{row.runs}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 2 }}>
                <Typography>{row.centuries}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 2 }}>
                <Typography>{row.strikeRate}</Typography>
              </Grid2>
              <Grid2 size={{ xs: 2 }}>
                <Typography>{row.avg}</Typography>
              </Grid2>
            </React.Fragment>
          ))}
        </Grid2>
      </Paper>
    </div>
  );
};


export default App
