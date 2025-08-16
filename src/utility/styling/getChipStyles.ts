import { type Theme } from '@mui/material/styles';

export const getChipStyles = (theme: Theme, type: string) => {
    switch (type) {
      case "datastore":
        return {
          label: "DS",
          sx: {
            backgroundColor: theme.palette.success.main,
            color: theme.palette.getContrastText(theme.palette.success.main),
          },
        }
      case "project":
        return {
          label: "PR",
          sx: {
            backgroundColor: theme.palette.accent1.vibrant,
            color: theme.palette.getContrastText(theme.palette.accent1.vibrant),
          },
        }
      case "dataset":
        return {
          label: "DT",
          sx: {
            backgroundColor: theme.palette.accent2.vibrant,
            color: theme.palette.getContrastText(theme.palette.accent2.vibrant),
          },
        }
      default:
        return { label: "??", sx: {} }
    }
  }