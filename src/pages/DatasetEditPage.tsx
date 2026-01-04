import React, { useEffect, useMemo, useRef, useState } from "react"
import Grid from "@mui/material/Grid"
import {
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { useTheme } from "@mui/material/styles"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"

import DatastoreFilesPicker from "../components/functional/dataset/DatastoreFilesPicker"
import DatasetFilesPicker from "../components/functional/dataset/DatasetFilesPicker"
import { SStack } from "../components/styled/SStack"
import HeadingBlock from "../components/common/HeadingBlock"
import { useLoaderData } from "react-router-dom"
import { apolloClient } from "../apollo/apolloClient"
import { ADD_FILES_TO_DATASET_MUTATION } from "../graphql/query/datasetQuery"

type PickerFile = {
  id: string
  filename: string
  contentType?: string | null
  size?: number | null
  created_at?: number | string | null
  tags?: string[] | null
}

type DatasetItem = {
  id: string
  fileId: string
  createdAt?: string | null
  status?: string | null
}

type DatasetEditLoaderData = {
  dataset: {
    id: string
    name: string
    description?: string | null
    datastoreId: string
  }
  datasetItems: DatasetItem[]
  datastoreFiles: PickerFile[]
  datastoreFilesMeta: {
    totalCount: number
    limit: number
    offset: number
  }
}

const PlaceholderWidget = ({
  title,
  borderColor,
}: {
  title: string
  borderColor: string
}) => {
  const theme = useTheme()

  return (
    <SStack
      direction="column"
      spacing={1}
      radius="xs"
      padding={theme.custom.spacing.xs}
      sx={{
        border: `1px solid ${borderColor}`,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.palette.boxShadow.light,
      }}
    >
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: theme.custom.font.weight.medium,
          fontSize: theme.custom.font.size.md,
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: theme.palette.text.secondary }}
      >
        Placeholder (we’ll build this widget next)
      </Typography>
    </SStack>
  )
}

const DatasetEditPage = () => {
  const loaderData = useLoaderData() as DatasetEditLoaderData
  const theme = useTheme()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const drawerContainerRef = useRef<HTMLDivElement | null>(null)
  const [datastoreFiles, setDatastoreFiles] = useState<PickerFile[]>([])
  const [datasetFiles, setDatasetFiles] = useState<PickerFile[]>([])
  const [selectedDatastoreIds, setSelectedDatastoreIds] = useState<string[]>([])
  const [selectedDatasetIds, setSelectedDatasetIds] = useState<string[]>([])

  console.log('loaderData:', loaderData)
  useEffect(() => {
    const datastoreItems = loaderData.datastoreFiles ?? []
    const datasetItemFiles = (loaderData.datasetItems ?? []).map((item) => {
      const datastoreFile = datastoreItems.find(
        (file) => file.id === item.fileId
      )
      return (
        datastoreFile || {
          id: item.fileId,
          filename: item.fileId,
          created_at: item.createdAt ?? undefined,
        }
      )
    })

    const datasetIdSet = new Set(datasetItemFiles.map((file) => file.id))
    const remainingDatastore = datastoreItems.filter(
      (file) => !datasetIdSet.has(file.id)
    )

    setDatasetFiles(datasetItemFiles)
    setDatastoreFiles(remainingDatastore)
    setSelectedDatastoreIds([])
    setSelectedDatasetIds([])
  }, [loaderData.dataset.id, loaderData.datastoreFiles, loaderData.datasetItems])

  const datastoreIdSet = useMemo(
    () => new Set(datastoreFiles.map((file) => file.id)),
    [datastoreFiles]
  )
  const datasetIdSet = useMemo(
    () => new Set(datasetFiles.map((file) => file.id)),
    [datasetFiles]
  )

  const handleAddToDataset = async () => {
    if (!selectedDatastoreIds.length) return
    const selectedSet = new Set(selectedDatastoreIds)
    const toAdd = datastoreFiles.filter((file) => selectedSet.has(file.id))
    if (!toAdd.length) return

    const response = await apolloClient.mutate({
      mutation: ADD_FILES_TO_DATASET_MUTATION,
      variables: {
        datasetId: loaderData.dataset.id,
        fileIds: selectedDatastoreIds,
      },
    })
    console.log('Add files to dataset response:', response)
    const dedupedAdd = toAdd.filter((file) => !datasetIdSet.has(file.id))
    setDatasetFiles((prev) => [...dedupedAdd, ...prev])
    setDatastoreFiles((prev) =>
      prev.filter((file) => !selectedSet.has(file.id))
    )
    setSelectedDatastoreIds([])
  }

  const handleRemoveFromDataset = () => {
    if (!selectedDatasetIds.length) return
    const selectedSet = new Set(selectedDatasetIds)
    const toRemove = datasetFiles.filter((file) => selectedSet.has(file.id))
    if (!toRemove.length) return

    const dedupedAdd = toRemove.filter((file) => !datastoreIdSet.has(file.id))
    setDatastoreFiles((prev) => [...dedupedAdd, ...prev])
    setDatasetFiles((prev) => prev.filter((file) => !selectedSet.has(file.id)))
    setSelectedDatasetIds([])
  }

  return (
    <Box
      sx={{
        height: `calc(100vh - ${theme.custom.component.header.height}px)`,
        padding: theme.custom.spacing.xs,
        backgroundColor: theme.palette.background.paper,
        display: "flex",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <SStack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        padding={0}
        noBorder
        noShadow
        sx={{ flexShrink: 0 }}
      >
        <HeadingBlock
          heading={`Edit Dataset${loaderData.dataset?.name ? `: ${loaderData.dataset.name}` : ""}`}
          headingWeight={200}
          headingSize="h4"
          subheading="Select files from storage to add to this dataset. Also, remove unwanted files from the dataset."
          padding={theme.custom.spacing.xs}
        />
        <Stack direction="row" spacing={1} sx={{ pr: theme.custom.spacing.xs }}>
          <Button
            variant="outlined"
            onClick={() => setDrawerOpen((prev) => !prev)}
            sx={{
              borderRadius: theme.custom.radii.xs,
              fontSize: theme.custom.font.size.sm,
              color: theme.palette.accent1.vibrant,
              borderColor: theme.palette.accent1.vibrant,
              "&:hover": { backgroundColor: theme.palette.accent1.dim },
              whiteSpace: "nowrap",
              minWidth: 160,
            }}
          >
            {drawerOpen ? "Close Insights" : "View Insights"}
          </Button>
        </Stack>
      </SStack>

      <Box
        ref={drawerContainerRef}
        sx={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          gap: 1,
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            transition: "flex 0.2s ease",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 1,
              height: "100%",
            }}
          >
            <SStack direction="column" spacing={1} expand>
              <DatastoreFilesPicker
                initialFiles={datastoreFiles}
                onSelectionChange={setSelectedDatastoreIds}
              />
            </SStack>
            <SStack
              direction="column"
              spacing={2}
              width={88}
              justifyContent="center"
            >
              <Stack direction="column" spacing={2} alignItems="center">
                <Tooltip title="Add files to dataset" placement="right">
                  <IconButton
                    onClick={handleAddToDataset}
                    disabled={selectedDatastoreIds.length === 0}
                    sx={{
                      borderRadius: theme.custom.radii.xs,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.accent2.vibrant,
                      "&:hover": {
                        backgroundColor: theme.palette.accent2.dim,
                      },
                    }}
                  >
                    <ArrowForwardIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Remove files from dataset" placement="right">
                  <IconButton
                    onClick={handleRemoveFromDataset}
                    disabled={selectedDatasetIds.length === 0}
                    sx={{
                      borderRadius: theme.custom.radii.xs,
                      border: `1px solid ${theme.palette.divider}`,
                      color: theme.palette.accent1.vibrant,
                      "&:hover": {
                        backgroundColor: theme.palette.accent1.dim,
                      },
                    }}
                  >
                    <ArrowBackIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </SStack>

            <SStack direction="column" spacing={1} expand>
              <DatasetFilesPicker
                initialFiles={datasetFiles}
                onSelectionChange={setSelectedDatasetIds}
              />
            </SStack>
          </Box>
        </Box>

        <Box
          sx={{
            width: drawerOpen ? { xs: "100%", md: 420 } : 0,
            transition: "width 0.2s ease",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <Drawer
            anchor="right"
            variant="persistent"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            hideBackdrop
            ModalProps={{
              container: drawerContainerRef.current,
              disablePortal: true,
              keepMounted: true,
            }}
            PaperProps={{
              sx: {
                width: "100%",
                backgroundColor: theme.palette.background.paper,
                position: "relative",
                overflowX: "hidden",
                transition: "transform 0.2s ease",
                transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
                pointerEvents: drawerOpen ? "auto" : "none",
              },
            }}
            sx={{
              flexShrink: 0,
              "& .MuiDrawer-paper": { position: "relative" },
            }}
          >
            <Stack spacing={2} sx={{ p: theme.custom.spacing.xs }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography
                  variant="h6"
                  sx={{ fontWeight: theme.custom.font.weight.medium }}
                >
                  Dataset Insights
                </Typography>
              </Stack>

              <PlaceholderWidget
                title="Dataset Storage Widget (metrics, % by type, used storage)"
                borderColor={theme.palette.accent1.vibrant}
              />
              <PlaceholderWidget
                title="Projects Using This Dataset Widget"
                borderColor={theme.palette.accent2.vibrant}
              />
            </Stack>
          </Drawer>
        </Box>
      </Box>
    </Box>
  )
}

export default DatasetEditPage
