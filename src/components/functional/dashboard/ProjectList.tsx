import React from "react"
import { useTheme } from "@mui/material"
import CustomCard from "../../common/CustomCard"
import HeadingBlock from "../../common/HeadingBlock"
import { SStack } from "../../styled/SStack"

// Adjust this interface to match your actual dashboard/GraphQL project type
interface DashboardProject {
  id: string
  name: string
  description?: string | null
  status?: string | null
  updatedAt?: string | null
  createdAt?: string | null

  // org sometimes present, sometimes not
  organization?: { name?: string | null }
  orgName?: string | null

  // dataset info
  datasetsCount?: number | null
  datasets?: unknown[] | null
}

interface ProjectListProps {
  projects: DashboardProject[]
}

const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  const theme = useTheme()

  console.log('projs: ', projects)

  const getStatusColor = (
    status?: string | null
  ):
    | "default"
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning" => {
    const s = status?.toLowerCase().trim()
    switch (s) {
      case "active":
        return "success"
      case "archived":
        return "default"
      case "in_review":
      case "in review":
      case "pending":
        return "warning"
      default:
        return "info"
    }
  }

  const getStatusLabel = (status?: string | null): string => {
    if (!status) return "Unknown"
    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const formatDate = (iso?: string | null): string => {
    if (!iso) return "Not updated yet"
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return "Not updated yet"
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const getDatasetsCount = (project: DashboardProject): number => {
    if (typeof project.datasetsCount === "number") return project.datasetsCount
    if (Array.isArray(project.datasets)) return project.datasets.length
    return 0
  }

  const getOrgName = (project: DashboardProject): string => {
    return (
      project.organization?.name ??
      project.orgName ??
      "No organization specified"
    )
  }

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor="transparent"
      paddingSize="md"
      marginSize="sm"
      noShadow
      noBorder
      expand
      sx={{
        overflowY: "auto",
        maxHeight: "100%",
      }}
    >
      <HeadingBlock
        heading="Project List"
        subheading="These are your current projects. Select one to work on, or create a new project."
        headingSize="h4"
        headingWeight={theme.custom.font.weight.regular}
        subSize="body1"
      />

      {projects.length === 0 && (
        <CustomCard
          title="No projects yet"
          orgName="—"
          description="Create your first project to get started."
          statusLabel=""
          statusColor="default"
          datasetsCount={0}
          lastUpdated="—"
          accentColor="accent1"
          onOpen={() => {}}
          onSettings={() => {}}
          onMenuClick={() => {}}
          disableShadow
        />
      )}

      {projects.map((project) => (
        <CustomCard
          key={project.id}
          title={project.name} // DB 'name' → card 'title'
          orgName={getOrgName(project)} // handles missing org
          description={project.description ?? "No description yet."}
          statusLabel={getStatusLabel(project.status)}
          statusColor={getStatusColor(project.status)}
          datasetsCount={getDatasetsCount(project)}
          lastUpdated={formatDate(project.updatedAt ?? project.createdAt)}
          accentColor="accent1"
          onOpen={() =>
            console.log(`Open project ${project.id} - ${project.name}`)
          }
          onSettings={() =>
            console.log(`Settings for project ${project.id} - ${project.name}`)
          }
          onMenuClick={() =>
            console.log(`Menu for project ${project.id} - ${project.name}`)
          }
        />
      ))}
    </SStack>
  )
}

export default ProjectList
