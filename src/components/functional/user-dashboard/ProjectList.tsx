import React from 'react'
import { SStack } from '../../styled/SStack'
import { Typography } from '@mui/material'
import CustomCard from '../../common/Card'

const ProjectList = () => {
    const projects = [
  {
    title: "Dataset Collaboration Portal",
    orgName: "Research Group A",
    description: "A project to analyze and process student performance datasets.",
    statusLabel: "Active",
    statusColor: "success" as const,
    datasetsCount: 3,
    lastUpdated: "Aug 10, 2025",
    accentColor: "accent1" as const,
  },
  {
    title: "Climate Data Visualization",
    orgName: "Environmental Studies Org",
    description: "Visualizing climate change data from multiple global sources.",
    statusLabel: "In Review",
    statusColor: "warning" as const,
    datasetsCount: 5,
    lastUpdated: "Aug 8, 2025",
    accentColor: "accent2" as const,
  },
  {
    title: "Neuroscience Imaging Project",
    orgName: "NeuroLab Research",
    description: "Analyzing brain imaging data to identify neural pathways.",
    statusLabel: "Archived",
    statusColor: "default" as const,
    datasetsCount: 8,
    lastUpdated: "Jul 30, 2025",
    accentColor: "accent1" as const,
  }
]

  return (
    <SStack
      direction="column"
      spacing={2}
      radius="lg"
      bgColor={["transparent"]}
      paddingSize="md"
      marginSize="sm"
      noShadow
      expand
    >
        <Typography variant="h6">Project List</Typography>
        <Typography variant="body2">This is a summary of the projects.</Typography>

         {projects.map((project, index) => (
           <CustomCard
             key={project.title + index}
             {...project}
             onOpen={() => console.log(`Open ${project.title}`)}
             onSettings={() => console.log(`Settings for ${project.title}`)}
             onMenuClick={() => console.log(`Menu for ${project.title}`)}
           />
         ))}

    </SStack>
  )
}

export default ProjectList