import type { TinaCMS } from 'tinacms';

// Tina's breadcrumb back arrow always opens the collection list. From a
// project, that drops the project you were editing. In the visual editor,
// send that arrow back to the project instead. The Entities directory keeps
// the list.

type FormRecord = {
  tinaForm?: {
    id?: string;
    values?: { title?: string };
  };
};

type EditorCms = TinaCMS & {
  state?: {
    editingMode?: string;
    activeFormId?: string | null;
    forms?: FormRecord[];
  };
  dispatch?: (action: { type: string; value: unknown }) => void;
};

const BACK_BUTTON = 'button[aria-label="Back to Entities"]';

function projectForm(cms: EditorCms): FormRecord | undefined {
  return cms.state?.forms?.find((form) => String(form.tinaForm?.id || '').includes('/content/portfolio/'));
}

function projectLabel(form: FormRecord): string {
  const title = form.tinaForm?.values?.title?.trim();
  if (title) return title;
  const base = String(form.tinaForm?.id || '').split('/').pop() || 'Project';
  return base.replace(/\.(md|mdx|json)$/i, '');
}

function openedFromProject(cms: EditorCms): FormRecord | undefined {
  const activeId = cms.state?.activeFormId;
  const fromProject =
    cms.state?.editingMode === 'visual' &&
    typeof activeId === 'string' &&
    activeId.includes('/content/entities/');
  if (!fromProject) return undefined;
  return projectForm(cms);
}

function syncBackButton(cms: EditorCms) {
  const button = document.querySelector<HTMLButtonElement>(BACK_BUTTON);
  if (!button) return;
  const project = openedFromProject(cms);
  const label = button.querySelector('span');
  if (!project?.tinaForm?.id) return;
  const title = projectLabel(project);
  button.dataset.phcProjectId = project.tinaForm.id;
  button.setAttribute('aria-label', `Back to ${title}`);
  if (label && label.textContent !== title) label.textContent = title;
}

export function keepProjectBackButton(cms: TinaCMS): TinaCMS {
  const editor = cms as EditorCms;
  if (typeof document === 'undefined') return cms;

  const onClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('button');
    if (!button) return;
    const label = button.getAttribute('aria-label') || '';
    if (label !== 'Back to Entities' && !button.dataset.phcProjectId) return;
    syncBackButton(editor);
    const projectId = button.dataset.phcProjectId;
    if (!projectId || !editor.dispatch) return;
    event.preventDefault();
    event.stopPropagation();
    editor.dispatch({
      type: 'forms:set-active-field-name',
      value: { formId: projectId, fieldName: '' },
    });
  };

  window.addEventListener('click', onClick, true);
  const observer = new MutationObserver(() => syncBackButton(editor));
  observer.observe(document.body, { childList: true, subtree: true });
  syncBackButton(editor);
  return cms;
}
