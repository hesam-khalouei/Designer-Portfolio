import { createRoot } from "react-dom/client";
import {
  AdminBadge,
  AdminButton,
  AdminCard,
  AdminInput,
  AdminSectionHeading,
} from "../../../src/admin/design-system";
import "../../../src/admin/styles/admin-tokens.css";
import "../../../src/admin/styles/admin.css";

function DesignSystemFixture() {
  return (
    <main className="admin-app" data-testid="admin-fixture">
      <AdminSectionHeading
        eyebrow="Verification"
        title="Design System Fixture"
        description="Isolated rendering and interaction tests."
      />

      <AdminCard data-testid="card" role="group" aria-label="Fixture card">
        <AdminBadge tone="success" data-testid="badge" title="Badge native title">Active</AdminBadge>
        <AdminButton data-testid="enabled-button" title="Button native title" onClick={() => {
          document.querySelector("#button-result")!.textContent = "Clicked";
        }}>
          Test Button
        </AdminButton>
        <AdminButton data-testid="disabled-button" disabled>
          Disabled Button
        </AdminButton>
        <AdminInput
          id="fixture-input"
          label="Project name"
          hint="Enter a project name."
          error="This field has an example error."
          placeholder="Project name"
          name="projectName"
          autoComplete="off"
        />
        <p id="button-result" aria-live="polite">Not clicked</p>
      </AdminCard>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<DesignSystemFixture />);
