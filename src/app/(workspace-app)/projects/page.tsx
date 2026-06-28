import { ProjectsView } from "@/features/workspace/views/projects-view";

export const metadata = {
  title: "Projects & Tasks Board — RivexaFlow",
  description: "Trello-style Kanban task pipelines, sprint milestones, and projects management",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
