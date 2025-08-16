import React, { useState } from "react"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Stack from "@mui/material/Stack"
import Switch from "@mui/material/Switch"
import FormControlLabel from "@mui/material/FormControlLabel"
import { useTheme } from "@mui/material/styles"
import HeadingBlock from "../../../common/HeadingBlock"
import { SStack } from "../../../styled/SStack"
import { Button } from "@mui/material"

const LlmWidget = () => {
  const theme = useTheme()
  const [question, setQuestion] = useState("")
  const [guidance, setGuidance] = useState(false)

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["transparent"]}
      noBorder
      noShadow
      sx={{ flexShrink: 0 }}
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
        <CardContent>
          <HeadingBlock
            heading="LLM Guide"
            subheading="Hi, I’m Lucy your LLM guide. Ask a question or turn on guidance."
            headingSize="h6"
            subSize="body2"
            headingWeight={theme.custom.font.weight.regular}
          />
          {/* Question Text Area */}
          <TextField
            label="Ask Lucy..."
            placeholder="Type your question here"
            multiline
            minRows={3}
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            sx={{
              mt: 1,
              mb: 1,
              "& .MuiOutlinedInput-root": {
                borderRadius: theme.custom.radii.xs,
              },
            }}
          />

          {/* Guidance Toggle */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="body2" color="text.secondary">
              Turn on Guidance
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={guidance}
                  onChange={(e) => setGuidance(e.target.checked)}
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: theme.palette.success.light, // anchor (thumb) green
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: theme.palette.success.light, // lighter background
                    },
                  }}
                />
              }
              label=""
              sx={{ m: 0 }}
            />
          </Stack>
           <Stack direction="row" spacing={2}>
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
              Settings
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </SStack>
  )
}

export default LlmWidget
