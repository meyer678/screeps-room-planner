import { ThemeProvider } from '@mui/material/styles';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { themeOptions } from './utils/theme';
import { SettingsProvider } from './contexts/SettingsContext';
import { RoomGridProvider } from './contexts/RoomGridContext';
import { RoomStructuresProvider } from './contexts/RoomStructuresContext';
import { RoomTerrainProvider } from './contexts/RoomTerrainContext';
import { HoverTileProvider } from './contexts/HoverTileContext';

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={themeOptions}>
      <SettingsProvider>
        <HoverTileProvider>
          <RoomGridProvider>
            <RoomStructuresProvider>
              <RoomTerrainProvider>
                <App />
              </RoomTerrainProvider>
            </RoomStructuresProvider>
          </RoomGridProvider>
        </HoverTileProvider>
      </SettingsProvider>
    </ThemeProvider>
  </React.StrictMode>
);
