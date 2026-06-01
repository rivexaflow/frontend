import { employeesByManager, type HrmEmployee } from "@/features/workspace/data/hrm-org-demo";

export const ORG_CARD_WIDTH = 252;
export const ORG_CARD_HEIGHT = 228;
export const ORG_LEVEL_GAP_Y = 72;
export const ORG_SIBLING_GAP_X = 40;

/** Level breadths for sizing the scrollable canvas. */
export function measureOrgTree(employees: HrmEmployee[]) {
  const levelWidths: number[] = [];
  let queue: string[] = employeesByManager(employees, null).map((e) => e.id);

  if (queue.length === 0) {
    return { canvasWidth: 1200, canvasHeight: 800, depth: 1 };
  }

  while (queue.length > 0) {
    levelWidths.push(queue.length);
    queue = queue.flatMap((id) =>
      employeesByManager(employees, id).map((e) => e.id),
    );
  }

  const depth = levelWidths.length;
  const maxBreadth = Math.max(...levelWidths, 1);
  const canvasWidth = Math.max(
    960,
    maxBreadth * (ORG_CARD_WIDTH + ORG_SIBLING_GAP_X) + 160,
  );
  const canvasHeight = Math.max(
    720,
    depth * (ORG_CARD_HEIGHT + ORG_LEVEL_GAP_Y) + 120,
  );

  return { canvasWidth, canvasHeight, depth, maxBreadth };
}
