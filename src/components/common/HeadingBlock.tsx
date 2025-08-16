import React from "react"
import Typography from "@mui/material/Typography"
import Stack from "@mui/material/Stack"
import { useTheme } from "@mui/material/styles"

interface HeadingBlockProps {
  heading: string
  subheading?: string
  align?: "left" | "center" | "right"
  width?: string | number
  padding?: string | number
  color?: string
  subColor?: string
  headingWeight?: number
  headingSize?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "body1" | "body2"
  subSize?: "body1" | "body2" | "caption"
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({
  heading,
  subheading,
  align = "left",
  width = "100%",
  padding = 0,
  color,
  subColor,
  headingWeight = 600,
  headingSize = "h6",
  subSize = "body2",
}) => {
  const theme = useTheme()

  return (
    <Stack
      spacing={0.2} // tighter spacing between heading & subheading
      sx={{
        textAlign: align,
        width,
        padding,
      }}
    >
      <Typography
        variant={headingSize}
        sx={{
          fontWeight: headingWeight,
          color: color || theme.palette.text.primary,
        }}
      >
        {heading}
      </Typography>
      {subheading && (
        <Typography
          variant={subSize}
          sx={{
            color: subColor || theme.palette.text.secondary,
          }}
        >
          {subheading}
        </Typography>
      )}
    </Stack>
  )
}

export default HeadingBlock
