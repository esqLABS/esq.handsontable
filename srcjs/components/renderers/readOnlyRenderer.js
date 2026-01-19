import { textRenderer } from 'handsontable/renderers';

/**
 * Renderer for read-only cells with gray background styling
 */
export function readOnlyRenderer(
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) {
  textRenderer.apply(this, arguments);
  td.style.background = "#eeeeee";
  td.title = '';
  return td;
}

/**
 * Renderer for invalid cells with red background
 */
export function invalidCellRenderer(
  instance,
  td,
  row,
  col,
  prop,
  value,
  cellProperties
) {
  textRenderer.apply(this, arguments);
  td.style.background = "#ffbeba";
  return td;
}
