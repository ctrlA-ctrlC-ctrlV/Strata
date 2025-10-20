import { estimate } from '../../lib/price';
import { track } from '../../analytics/events';
import type { ConfigState } from '../../components/configurator/types';
import { renderSizeStep } from '../../components/configurator/size-step';
import { renderOpeningsStep } from '../../components/configurator/openings-step';
import { renderCladdingStep } from '../../components/configurator/cladding-step';
import { renderBathroomStep } from '../../components/configurator/bathroom-step';
import { renderFloorStep } from '../../components/configurator/floor-step';
import { renderExtrasStep } from '../../components/configurator/extras-step';
import { renderProgress } from '../../components/progress';
import { renderSummary } from '../../components/configurator/summary';
import { renderQuoteForm } from '../../components/configurator/quote-form';
import { renderConfirmation } from '../../components/configurator/confirmation';
import { attachEmailDesignButtons } from '../../components/configurator/email-design';

const stepsEl = document.getElementById('steps')!;
const summaryEl = document.getElementById('summary')!;
const progressEl = document.getElementById('progress')!;
const confirmationEl = document.getElementById('confirmation')!;

let state: ConfigState = {
  widthM: 3,
  depthM: 3,
  vat: true,
  openings: { windows: 0, doors: 0, skylights: 0 },
  cladding: 'panel',
  bathroom: 'none',
  floor: 'none',
  extras: new Set()
};
let stepIndex = 0;

function render() {
  stepsEl.innerHTML = `<div id="step"></div><div id="nav"><button id="prev" ${stepIndex===0?'disabled':''}>Back</button><button id="next">Next</button><button id="summ" ${stepIndex<5?'disabled':''}>Summary</button></div>`;
  const stepRoot = stepsEl.querySelector('#step') as HTMLElement;
  const onChange = (patch: Partial<ConfigState>) => { state = { ...state, ...patch }; updateEstimate(); };
  const steps = [
    () => renderSizeStep(stepRoot, state, onChange),
    () => renderOpeningsStep(stepRoot, state, onChange),
    () => renderCladdingStep(stepRoot, state, onChange),
    () => renderBathroomStep(stepRoot, state, onChange),
    () => renderFloorStep(stepRoot, state, onChange),
    () => renderExtrasStep(stepRoot, state, onChange)
  ];
  steps[stepIndex]();
  stepsEl.querySelector('#prev')?.addEventListener('click', () => { if (stepIndex>0) { stepIndex--; render(); } });
  stepsEl.querySelector('#next')?.addEventListener('click', () => { if (stepIndex<steps.length-1) { stepIndex++; render(); } });
  stepsEl.querySelector('#summ')?.addEventListener('click', showSummary);
  updateEstimate();
}

function showSummary() {
  summaryEl.hidden = false;
  renderSummary(summaryEl, state);
  const actions = summaryEl.querySelector('#summary-actions') as HTMLElement | null;
  if (actions) {
    // Enhance: allow emailing or downloading the design summary
    attachEmailDesignButtons(actions, state);
    // Render quote form with progressive enhancement; fallback still posts normally
    const formMount = document.createElement('div');
    actions.appendChild(formMount);
    renderQuoteForm(formMount, {
      state,
      onSubmitted: () => {
        stepsEl.hidden = true;
        renderConfirmation(confirmationEl as HTMLElement);
        confirmationEl.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
  track('summary_viewed', { widthM: state.widthM, depthM: state.depthM });
}

function updateEstimate() {
  const price = estimate({ widthM: state.widthM, depthM: state.depthM, vat: state.vat, extras: [] });
  const estText = `Estimate: €${price.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
  renderProgress(progressEl, stepIndex, 6, estText);
}

render();
