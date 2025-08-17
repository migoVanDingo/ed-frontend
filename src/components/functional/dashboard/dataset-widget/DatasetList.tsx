import React, { useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Chip from "@mui/material/Chip"
import IconButton from "@mui/material/IconButton"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Link from "@mui/material/Link"
import { useTheme } from "@mui/material/styles"
import { DataGrid, type GridColDef } from "@mui/x-data-grid"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"
import StarIcon from "@mui/icons-material/Star"
import MoreVertIcon from "@mui/icons-material/MoreVert"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"

interface Dataset {
  id: string
  name: string
  type: string[]
  updated_at: string
  status: "active" | "archived" | "error"
  stars: number
  owner: string
}

interface DatasetListProps {
  datasets?: Dataset[]
  onRowClick?: (dataset: Dataset) => void
}

const DatasetList: React.FC<DatasetListProps> = ({
  datasets = [
    {
      id: "1",
      name: "Customer Records",
      type: ["CSV", "JSON"],
      updated_at: "2025-08-10T14:22:00Z",
      status: "active",
      stars: 48,
      owner: "Alice Johnson",
    },
    {
      id: "2",
      name: "Event Logs",
      type: ["JSON"],
      updated_at: "2025-08-12T09:10:00Z",
      status: "active",
      stars: 20,
      owner: "Bob Smith",
    },
    {
      id: "3",
      name: "Product Images",
      type: ["Images"],
      updated_at: "2025-08-14T17:45:00Z",
      status: "archived",
      stars: 12,
      owner: "Charlie Davis",
    },
  ],
  onRowClick,
}) => {
  const theme = useTheme()

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [menuRowId, setMenuRowId] = useState<string | null>(null)

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    rowId: string
  ) => {
    setAnchorEl(event.currentTarget)
    setMenuRowId(rowId)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setMenuRowId(null)
  }

  const chipColors: Record<string, string> = {
    CSV: theme.palette.colors.blue[500],
    JSON: theme.palette.colors.green[500],
    Images: theme.palette.colors.orange[500],
  }

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 180,
      renderCell: (params: any) => (
        <Link
          href={`/datasets/${params.row.id}`}
          underline="hover"
          sx={{
            color: theme.palette.accent1.vibrant,
            fontWeight: theme.custom.font.weight.medium,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "type",
      headerName: "Type",
      width: 200,
      renderCell: (params: any) => (
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {params.value.map((t: string, i: number) => (
            <Chip
              key={i}
              label={t}
              size="small"
              sx={{
                backgroundColor: chipColors[t] || theme.palette.grey[300],
                color: theme.palette.primary.light,
                fontSize: theme.custom.font.size.sm,
                fontWeight: theme.custom.font.weight.bold,
                height: 30,
              }}
            />
          ))}
        </div>
      ),
    },
    {
      field: "owner",
      headerName: "Owner",
      width: 160,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: theme.custom.font.size.md,
            color: theme.palette.text.primary,
            fontWeight: theme.custom.font.weight.regular,
          }}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "updated_at",
      headerName: "Last Updated",
      width: 150,
      renderCell: (params: any) => (
        <span
          style={{
            fontSize: theme.custom.font.size.md,
            color: theme.palette.text.secondary,
          }}
        >
          {formatRelativeTime(params.value)}
        </span>
      ),
    },
    {
      field: "stars",
      headerName: "Notoriety",
      width: 140,
      renderCell: (params: any) => (
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: theme.custom.font.size.sm,
            color: theme.palette.text.secondary,
          }}
        >
          <StarIcon
            fontSize="small"
            sx={{ color: theme.palette.colors.yellow[600] }}
          />
          x{params.value}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 70,
      sortable: false,
      renderCell: (params: any) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuOpen(e, params.row.id)}
        >
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
      bgColor={["transparent"]}
      noShadow
      noBorder
      sx={{ flex: 6, flexShrink: 0 }}
    >
      <Card
        sx={{
          borderRadius: theme.custom?.radii?.xs,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          boxShadow: "none",
          border: "none",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            boxShadow: "none",
            border: "none",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <HeadingBlock
            heading="Datasets"
            headingSize="h4"
            subheading="View and manage your datasets. Click on the row to view its specific details in the insights widget or click the dataset name to explore its contents."
            headingWeight={theme.custom.font.weight.regular}
            padding={0}
          />

          <div style={{ flex: 1, marginTop: theme.custom.spacing.xs }}>
            <DataGrid
              rows={datasets}
              columns={columns}
              pageSizeOptions={[5, 10]}
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } },
              }}
              disableRowSelectionOnClick
              getRowId={(row) => row.id}
              showToolbar
              slotProps={{
                toolbar: {
                  showQuickFilter: true,
                  quickFilterProps: { debounceMs: 300 },
                },
              }}
              sx={{
                border: "none",
                boxShadow: "none",
                backgroundColor: "transparent", // ✅ kills DataGrid’s default bg
                "& .MuiDataGrid-main": {
                  backgroundColor: "transparent", // ✅ nukes nested wrapper bg
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "transparent", // ✅ headers transparent
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
          </div>
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
        <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
      </Menu>
    </SStack>
  )
}

export default DatasetList
