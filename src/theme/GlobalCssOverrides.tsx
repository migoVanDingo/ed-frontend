import React from 'react'
import { GlobalStyles } from '@mui/material';

export default function GlobalCssOverrides() {
  return (
    <GlobalStyles
      styles={{
        '*': {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
        html: {
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
          fontFamily: "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif",
          backgroundColor: '#f5f5f5', // or theme.palette.background.default
        },
        ul: {
          listStyle: 'none',
        },
        a: {
          textDecoration: 'none',
          color: 'inherit',
        },
        img: {
          maxWidth: '100%',
          height: 'auto',
        },
      }}
    />
  );
}
