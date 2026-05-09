import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: RouteComponent,
  beforeLoad: async () => {
    redirect({ to: "/diary", throw: true });
  },
});

function RouteComponent() {
  return null;
}
