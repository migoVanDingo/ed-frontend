import React, { useState } from "react"
import { Box, Button, Stack, IconButton, Menu, MenuItem, Chip } from "@mui/material"
import { useTheme, type Theme } from "@mui/material/styles"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"

type Role = "Owner" | "Editor" | "Viewer"

interface Contributor {
  id: string
  name: string
  role: Role
}

// Mock data
const mockContributors: Contributor[] = [
  { id: "u1", name: "Alice Johnson", role: "Owner" },
  { id: "u2", name: "Bob Smith", role: "Editor" },
  { id: "u3", name: "Charlie Davis", role: "Viewer" },
  { id: "u4", name: "Dana Patel", role: "Editor" },
]

const ContributorsWidget: React.FC = () => {
  const theme = useTheme()

  // row menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)

  const openMenu = (e: React.MouseEvent<HTMLElement>, rowId: string) => {
    setAnchorEl(e.currentTarget)
    setMenuRowId(rowId)
  }
  const closeMenu = () => {
    setAnchorEl(null)
    setMenuRowId(null)
  }

  const roleColor: Record<Role, string> = {
    Owner: theme.palette?.colors?.purple?.[500] ?? "#8b5cf6",
    Editor: theme.palette?.colors?.blue?.[500] ?? "#3b82f6",
    Viewer: theme.palette?.colors?.grey?.[500] ?? "#9ca3af",
  }

  const columns: GridColDef<Contributor>[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "role",
      headerName: "Role",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={params.value as Role}
          size="small"
          sx={{
            backgroundColor: roleColor[params.value as Role],
            color: theme.palette.common.white,
            fontSize: theme.custom.font.size.sm,
            fontWeight: theme.custom.font.weight.bold,
            height: 26,
          }}
        />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => openMenu(e, params.row.id)}>
          <MoreVertIcon fontSize="small" />
        </IconButton>
      ),
    },
  ]

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      sx={{ flexGrow: 1, width: "100%", minHeight: 0, backgroundColor: theme.palette.background.default }}
      height="100%"
    >
      {/* Heading */}
      <HeadingBlock
        heading="Contributors"
        headingSize="h5"
        headingStyle={{ padding: '1rem 0 0 1rem'}}
        headingWeight={theme.custom.font.weight.regular}
        padding={0}
      />

      {/* DataGrid */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <DataGrid
          rows={mockContributors}
          columns={columns}
          getRowId={(r) => r.id}
          hideFooter
          disableRowSelectionOnClick
          sx={{
            border: "none",
            boxShadow: "none",
            backgroundColor: "transparent",
            "& .MuiDataGrid-main": { backgroundColor: "transparent" },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: "transparent",
              fontWeight: theme.custom.font.weight.bold,
              color: theme.palette.text.primary,
              fontSize: theme.custom.font.size.md,
            },
            "& .MuiDataGrid-cell": {
              display: "flex",
              alignItems: "center",
              borderBottom: `1px solid ${theme.palette.divider}`,
            },
            "& .MuiDataGrid-row:hover": {
              backgroundColor: theme.palette.action.hover,
              cursor: "pointer",
            },
            "& .MuiDataGrid-row:nth-of-type(even)": {
              backgroundColor:
                theme.palette.mode === "dark"
                  ? theme.palette.grey[900]
                  : theme.palette.grey[50],
            },
          }}
        />
      </Box>

      {/* Row Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem onClick={closeMenu}>View Profile</MenuItem>
        <MenuItem onClick={closeMenu}>Update Role</MenuItem>
        <MenuItem onClick={closeMenu}>Rescind Access</MenuItem>
      </Menu>

      {/* Bottom Actions */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1}
        sx={{
          p: theme.custom.spacing.xs,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Button
          variant="outlined"
          size="small"
          sx={(t: Theme) => ({
            borderRadius: t.custom?.radii?.xs,
            fontSize: t.custom.font.size.sm,
            color: t.palette.accent1.vibrant,
            borderColor: t.palette.accent1.vibrant,
            "&:hover": { backgroundColor: t.palette.accent1.dim },
          })}
        >
          View All
        </Button>
        <Button
          variant="contained"
          size="small"
          sx={(t: Theme) => ({
            color: t.palette.getContrastText(t.palette.accent1.vibrant),
            borderRadius: t.custom?.radii?.xs,
            fontSize: t.custom.font.size.sm,
            backgroundColor: t.palette.accent1.vibrant,
            "&:hover": { backgroundColor: t.palette.accent1.dim },
          })}
        >
          Add
        </Button>
      </Stack>
    </SStack>
  )
}

export default ContributorsWidget
