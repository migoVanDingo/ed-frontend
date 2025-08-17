import React from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import Button from "@mui/material/Button"
import Chip from "@mui/material/Chip"
import { useTheme } from "@mui/material/styles"
import HeadingBlock from "../../../common/HeadingBlock"
import { formatRelativeTime } from "../../../../utility/formatter/timeHelper"
import { SStack } from "../../../styled/SStack"
import { getChipStyles } from "../../../../utility/styling/getChipStyles"

const RecentActivity = () => {
  const theme = useTheme()

  const activities = [
    {
      user: "Alice",
      action: "uploaded to",
      entity: "Datastore",
      type: "datastore",
      date: "2025-08-12T10:00:00Z",
    },
    {
      user: "Bob",
      action: "ran pipeline in",
      entity: "Climate Project",
      type: "project",
      date: "2025-08-15T01:00:00Z",
    },
    {
      user: "Eve",
      action: "created dataset",
      entity: "Brain Imaging",
      type: "dataset",
      date: "2025-08-14T18:30:00Z",
    },
  ]

  // map type -> chip colors
  

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["transparent"]}
      noBorder
      noShadow
      sx={{ flexShrink: 0 }}
      expand
    >
      <Card
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: theme.custom?.radii?.xs,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.palette.boxShadow?.light,
          display: "flex",
          flexDirection: "column",
          height: '100%'
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <HeadingBlock
            heading="Recent Activity"
            headingSize="h6"
            headingWeight={theme.custom.font.weight.regular}
            padding={0}
          />

          <Stack spacing={1.5} sx={{ mt: 1 }}>
            {activities.map((a, idx) => {
              const chipProps = getChipStyles(theme, a.type)
              return (
                <Stack
                  key={idx}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Chip
                    size="small"
                    label={chipProps.label}
                    sx={{
                      height: 20,
                      fontSize: "0.7rem",
                      ...chipProps.sx,
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    noWrap
                    sx={{ textOverflow: "ellipsis", overflow: "hidden" }}
                  >
                    <strong>{a.user}</strong> {a.action} <em>{a.entity}</em>{" "}
                    {formatRelativeTime(a.date)}
                  </Typography>
                </Stack>
              )
            })}
          </Stack>
        </CardContent>

        <Button
          variant="text"
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            borderRadius: 0,
            color: theme.palette.accent1.vibrant,
            "&:hover": { backgroundColor: theme.palette.accent1.dim },
          }}
        >
          View History
        </Button>
      </Card>
    </SStack>
  )
}

export default RecentActivity
