import { ResourcePage } from "./ResourcePage";
import type { RouteDefinition } from "../data/routes";

interface AgentsPageProps {
  route: RouteDefinition;
}

export function AgentsPage({ route }: AgentsPageProps) {
  return <ResourcePage route={route} />;
}
