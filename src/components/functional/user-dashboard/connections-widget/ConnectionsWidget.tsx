import React from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Stack from "@mui/material/Stack"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableHead from "@mui/material/TableHead"
import TableRow from "@mui/material/TableRow"
import Button from "@mui/material/Button"
import { useTheme } from "@mui/material/styles"
import HeadingBlock from "../../../common/HeadingBlock"
import StarIcon from "@mui/icons-material/Star"
import ShareIcon from "@mui/icons-material/Share"
import { SStack } from "../../../styled/SStack"

const ConnectionsWidget = () => {
  const theme = useTheme()

  // Mock data
  const members = [
    { name: "Alice Johnson", org: "Research Group A", stars: 42 },
    { name: "Bob Smith", org: "Climate Org", stars: 17 },
    { name: "Eve Tran", org: null, stars: 8 },
    { name: "Jonathan Superlonglastname", org: "Super Long Organization Name That Won't Fit", stars: 99 },
  ]

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["transparent"]}
      noShadow
      noBorder
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
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <HeadingBlock heading="Connections" headingSize="h6" headingWeight={200} padding={0} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Org</TableCell>
                
              </TableRow>
            </TableHead>
            <TableBody>
              {members.map((m, idx) => (
                <TableRow key={idx}>
                  <TableCell
                    sx={{
                      maxWidth: 140,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.name}
                  </TableCell>
                  <TableCell
                    sx={{
                      maxWidth: 160,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {m.org || "-"}
                  </TableCell>
              
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>

        {/* Actions */}
        <Stack direction="row" spacing={2} sx={{ p: 2, pt: 0 }}>
           <Button
              fullWidth
              variant="contained"
              sx={{
                color: theme.palette.getContrastText(
                  theme.palette.accent1.vibrant
                ),
                borderRadius: theme.custom?.radii?.xs,
                fontSize: theme.custom.font.size.sm,
                backgroundColor: theme.palette.accent1.vibrant,
                "&:hover": { backgroundColor: theme.palette.accent1.dim },
              }}
            >
              View All
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={{
                borderRadius: theme.custom?.radii?.xs,
                fontSize: theme.custom.font.size.sm,
                color: theme.palette.accent1.vibrant,
                borderColor: theme.palette.accent1.vibrant,
                "&:hover": { backgroundColor: theme.palette.accent1.dim },
              }}
            >
              Invite
            </Button>
        </Stack>
      </Card>
    </SStack>
  )
}

export default ConnectionsWidget
