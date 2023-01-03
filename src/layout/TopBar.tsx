import { AppBar, Toolbar, Typography } from '@mui/material';

export default function TopBar() {
  return (
    <AppBar position='fixed' sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar variant='dense'>
        <Typography variant='h6' noWrap component='div'>
          Screeps Room Planner
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
