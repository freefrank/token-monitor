'use strict';

(function exposeServiceStatusPresentation(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TokenMonitorServiceStatusPresentation = api;
})(typeof window !== 'undefined' ? window : null, function createServiceStatusPresentationApi() {
  // Split the affected component names into a short visible slice plus an
  // overflow count, so the meta line can show e.g. "Claude Code, API +2" while
  // the full list stays available (and the data is real text for a11y).
  function affectedComponentNames(componentIssues, limit = 2) {
    const names = (Array.isArray(componentIssues) ? componentIssues : [])
      .map((issue) => String(issue?.name || '').trim())
      .filter(Boolean);
    const max = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : names.length;
    return {
      all: names,
      visible: names.slice(0, max),
      overflow: Math.max(0, names.length - max)
    };
  }

  return { affectedComponentNames };
});
